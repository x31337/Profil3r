import json
import os
from datetime import datetime

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

from modules.facebook_automation import FacebookAutomation

app = Flask(__name__)
CORS(app)
app.config["UPLOAD_FOLDER"] = "/tmp/fb_evidence_uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///fb_reports.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    target_url = db.Column(db.String(512))
    justification = db.Column(db.Text)
    status = db.Column(db.String(32))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    evidence = db.relationship("Evidence", backref="report", lazy=True)


class Evidence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256))
    report_id = db.Column(db.Integer, db.ForeignKey("report.id"), nullable=False)


# Load Facebook accounts from config (JSON file or env var)
ACCOUNTS = []
if os.environ.get("FB_ACCOUNTS_JSON"):
    ACCOUNTS = json.loads(os.environ["FB_ACCOUNTS_JSON"])
elif os.path.exists("fb_accounts.json"):
    with open("fb_accounts.json", "r") as f:
        ACCOUNTS = json.load(f)


@app.before_first_request
def create_tables():
    db.create_all()


@app.route("/api/report", methods=["POST"])
def report():
    data = request.form
    target_url = data.get("target_url")
    justification = data.get("justification")
    # Save uploaded evidence files
    evidence_paths = []
    evidence_objs = []
    if "evidence" in request.files:
        files = request.files.getlist("evidence")
        for file in files:
            filename = secure_filename(file.filename)
            save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(save_path)
            evidence_paths.append(save_path)
            evidence_objs.append(Evidence(filename=filename))
    # Store report in DB
    report_obj = Report(
        target_url=target_url,
        justification=justification,
        status="pending",
        evidence=evidence_objs,
    )
    db.session.add(report_obj)
    db.session.commit()
    # Rotate through accounts for each report
    results = []
    for account in ACCOUNTS:
        email = account.get("email")
        password = account.get("password")
        config = {"headless": True}
        with FacebookAutomation(config=config) as fb:
            if fb.login_facebook(email, password):
                success = fb.report_content(target_url, justification, evidence_paths)
                results.append({"email": email, "success": success})
                report_obj.status = "success" if success else "failed"
            else:
                results.append(
                    {"email": email, "success": False, "error": "Login failed"}
                )
                report_obj.status = "failed"
    db.session.commit()
    return jsonify({"results": results, "report_id": report_obj.id})


@app.route("/api/reports", methods=["GET"])
def list_reports():
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return jsonify(
        [
            {
                "id": r.id,
                "target_url": r.target_url,
                "justification": r.justification,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
                "evidence": [e.filename for e in r.evidence],
            }
            for r in reports
        ]
    )


@app.route("/api/report/<int:report_id>", methods=["GET"])
def get_report(report_id):
    r = Report.query.get_or_404(report_id)
    return jsonify(
        {
            "id": r.id,
            "target_url": r.target_url,
            "justification": r.justification,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
            "evidence": [e.filename for e in r.evidence],
        }
    )


@app.route("/api/evidence/<filename>", methods=["GET"])
def get_evidence(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
