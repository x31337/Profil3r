import sys

if __name__ == "__main__" and len(sys.argv) > 1 and sys.argv[1] == "purge-secrets":
    import json
    import os

    from flask import Flask
    from flask_sqlalchemy import SQLAlchemy

    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///fb_reports.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db = SQLAlchemy(app)

    class Secret(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(64), unique=True, nullable=False)
        value = db.Column(db.LargeBinary, nullable=False)

    with app.app_context():
        db.create_all()
        db.session.query(Secret).delete()
        db.session.commit()
        print("All secrets purged from the database.")
    sys.exit(0)

# --- Everything below this line is only run for normal app startup ---
import json
import os
import sys

sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../modules"))
)
from datetime import datetime

from cryptography.fernet import Fernet
from facebook_automation import FacebookAutomation
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

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
    target_url = db.Column(db.String(512), index=True)
    justification = db.Column(db.Text)
    status = db.Column(db.String(32), index=True)
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

# Ensure SETUP_SECRET_KEY (Fernet key) is configured via environment variable
# This key is critical for encrypting/decrypting other secrets in the database.
# If not set, the app should not run or run in a degraded mode.
raw_setup_secret_key = os.environ.get("SETUP_SECRET_KEY")
if not raw_setup_secret_key:
    app.logger.critical(
        "CRITICAL: SETUP_SECRET_KEY environment variable is not set. "
        "This key is required for encrypting and decrypting secrets. "
        "Please generate a key (e.g., using 'python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"') "
        "and set it as an environment variable. Application may not function correctly with secrets."
    )
    # Fallback to a dummy key to allow app to run but secrets will not be persistent/secure
    # This is NOT recommended for production.
    FERNET = Fernet(Fernet.generate_key()) # Ephemeral key, secrets won't survive restart
else:
    try:
        FERNET = Fernet(raw_setup_secret_key.encode())
        app.logger.info("Successfully initialized Fernet with SETUP_SECRET_KEY from environment.")
    except Exception as e:
        app.logger.critical(
            f"CRITICAL: Failed to initialize Fernet with SETUP_SECRET_KEY: {e}. "
            "Ensure the key is a valid Fernet key. Application may not function correctly with secrets."
        )
        # Fallback to a dummy key if provided key is invalid
        FERNET = Fernet(Fernet.generate_key())


class Secret(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    value = db.Column(db.LargeBinary, nullable=False)


def generate_secret(length=32):
    import secrets
    import string

    alphabet = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(alphabet) for _ in range(length))


def store_secret(name, value):
    enc = FERNET.encrypt(value.encode())
    s = Secret.query.filter_by(name=name).first()
    if s:
        s.value = enc
    else:
        s = Secret(name=name, value=enc)
        db.session.add(s)
    db.session.commit()


def get_secret(name):
    s = Secret.query.filter_by(name=name).first()
    if s:
        return FERNET.decrypt(s.value).decode()
    return None


class BuildState(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    state_type = db.Column(
        db.String(32), nullable=False
    )  # e.g., 'build', 'test', 'deploy'
    status = db.Column(
        db.String(32), nullable=False
    )  # e.g., 'success', 'failed', 'in_progress'
    data = db.Column(db.Text, nullable=True)  # JSON-encoded state
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class TestResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    test_type = db.Column(
        db.String(32), nullable=False
    )  # e.g., 'cypress', 'unit', 'integration'
    status = db.Column(db.String(32), nullable=False)
    result = db.Column(db.Text, nullable=True)  # JSON-encoded result
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


def create_tables():
    with app.app_context():
        db.create_all()


# --- AUTO-FIX: Ensure FLASK_SECRET_KEY is always loaded from DB or generated, and set in app.config at startup ---
def ensure_flask_secret_key():
    key = get_secret("FLASK_SECRET_KEY")
    if not key:
        key = generate_secret(64)
        store_secret("FLASK_SECRET_KEY", key)
        # Also update .env
        env_path = ".env"
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                lines = f.readlines()
            with open(env_path, "w") as f:
                found = False
                for line in lines:
                    if line.startswith("FLASK_SECRET_KEY="):
                        f.write(f"FLASK_SECRET_KEY={key}\n")
                        found = True
                    else:
                        f.write(line)
                if not found:
                    f.write(f"FLASK_SECRET_KEY={key}\n")
        else:
            with open(env_path, "w") as f:
                f.write(f"FLASK_SECRET_KEY={key}\n")
    app.config["SECRET_KEY"] = key


# Call create_tables() once at startup
with app.app_context():
    create_tables()
    ensure_flask_secret_key()


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
    account_outcomes = [] # To track individual account success/failure

    for account in ACCOUNTS:
        email = account.get("email")
        password = account.get("password")
        # Pass a more complete config, could be expanded later
        automation_config = {
            "headless": True,
            "log_level": app.config.get("LOG_LEVEL", "INFO"), # Inherit log level
            "browser": app.config.get("SELENIUM_BROWSER", "chrome") # Allow browser config
        }

        current_result = {"email": email, "success": False, "message": "Unknown error"}

        try:
            with FacebookAutomation(config=automation_config) as fb:
                if fb.login_facebook(email, password):
                    # report_content now expects report_count=1 as it handles one attempt
                    report_outcome = fb.report_content(target_url, justification, evidence_paths, report_count=1)
                    current_result["success"] = report_outcome["success"]
                    current_result["message"] = report_outcome["message"]
                else:
                    current_result["message"] = "Login failed"
        except Exception as e:
            app.logger.error(f"Exception during FacebookAutomation for {email}: {e}", exc_info=True)
            current_result["message"] = f"Automation process error: {str(e)}"

        results.append(current_result)
        account_outcomes.append(current_result["success"])

    # Determine overall report status
    if not account_outcomes: # No accounts configured
        report_obj.status = "failed"
        report_obj.justification += " (No accounts configured for reporting)" # Append to justification
    elif all(account_outcomes):
        report_obj.status = "success"
    elif any(account_outcomes):
        report_obj.status = "partially_successful"
    else:
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


@app.route("/api/setup-secrets", methods=["POST"])
def setup_secrets():
    # Only allow if not already set up
    if Secret.query.count() > 0:
        return jsonify({"error": "Secrets already set up"}), 400
    # List of all secrets to generate for all services
    secrets_to_generate = [
        ("POSTGRES_PASSWORD", 32),
        ("FLASK_SECRET_KEY", 64),
        ("API_KEY", 40),
        ("FB_API_KEY", 32),
        ("FB_SECRET", 32),
        ("REAL_EMAIL_API_KEY", 40),
        ("VERIPHONE_API_KEY", 40),
        ("GITHUB_TOKEN", 40),
        ("JWT_SECRET", 64),
        ("PAGE_ACCESS_TOKEN", 64),
        ("VERIFY_TOKEN", 32),
        ("APP_SECRET", 64),
        ("PROXY_URL", 64),
        ("OSINT_API_KEY", 40),
        ("SHODAN_API_KEY", 40),
        ("VIRUSTOTAL_API_KEY", 40),
        ("REDIS_URL", 64),
    ]
    env_lines = []
    for name, length in secrets_to_generate:
        value = generate_secret(length)
        store_secret(name, value)
        env_lines.append(f"{name}={value}")
    # Write to .env (append, but only add if not already present)
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            existing = f.read()
    else:
        existing = ""
    with open(".env", "a") as f:
        for line in env_lines:
            key = line.split("=")[0]
            if key not in existing:
                f.write(line + "\n")
    return jsonify({"status": "secrets generated and stored encrypted in DB and .env"})


@app.route("/api/save-state", methods=["POST"])
def save_state():
    data = request.json
    state_type = data.get("state_type")
    status = data.get("status")
    state_data = json.dumps(data.get("data", {}))
    build_state = BuildState(state_type=state_type, status=status, data=state_data)
    db.session.add(build_state)
    db.session.commit()
    return jsonify({"status": "state saved", "id": build_state.id})


@app.route("/api/get-latest-state", methods=["GET"])
def get_latest_state():
    state_type = request.args.get("state_type")
    state = (
        BuildState.query.filter_by(state_type=state_type)
        .order_by(BuildState.created_at.desc())
        .first()
    )
    if not state:
        return jsonify({"error": "No state found"}), 404
    return jsonify(
        {
            "id": state.id,
            "state_type": state.state_type,
            "status": state.status,
            "data": json.loads(state.data) if state.data else {},
            "created_at": state.created_at.isoformat(),
        }
    )


@app.route("/api/save-test-result", methods=["POST"])
def save_test_result():
    data = request.json
    test_type = data.get("test_type")
    status = data.get("status")
    result = json.dumps(data.get("result", {}))
    test_result = TestResult(test_type=test_type, status=status, result=result)
    db.session.add(test_result)
    db.session.commit()
    return jsonify({"status": "test result saved", "id": test_result.id})


@app.route("/api/get-latest-test-result", methods=["GET"])
def get_latest_test_result():
    test_type = request.args.get("test_type")
    result = (
        TestResult.query.filter_by(test_type=test_type)
        .order_by(TestResult.created_at.desc())
        .first()
    )
    if not result:
        return jsonify({"error": "No test result found"}), 404
    return jsonify(
        {
            "id": result.id,
            "test_type": result.test_type,
            "status": result.status,
            "result": json.loads(result.result) if result.result else {},
            "created_at": result.created_at.isoformat(),
        }
    )


# --- AUTO-FIX: Add endpoint to rotate FLASK_SECRET_KEY, update DB and .env, and reload Flask config ---
@app.route("/api/rotate-flask-secret", methods=["POST"])
def rotate_flask_secret():
    new_key = generate_secret(64)
    store_secret("FLASK_SECRET_KEY", new_key)
    # Update .env
    env_path = ".env"
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()
        with open(env_path, "w") as f:
            found = False
            for line in lines:
                if line.startswith("FLASK_SECRET_KEY="):
                    f.write(f"FLASK_SECRET_KEY={new_key}\n")
                    found = True
                else:
                    f.write(line)
            if not found:
                f.write(f"FLASK_SECRET_KEY={new_key}\n")
    else:
        with open(env_path, "w") as f:
            f.write(f"FLASK_SECRET_KEY={new_key}\n")
    app.config["SECRET_KEY"] = new_key
    return jsonify(
        {
            "status": "FLASK_SECRET_KEY rotated, updated in DB and .env, and Flask config reloaded"
        }
    )


@app.route("/")
def root():
    return send_from_directory(os.path.dirname(__file__), "index.html")


@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(os.path.dirname(__file__), path)


if __name__ == "__main__":
    # Only run normal startup if not purging secrets
    with app.app_context():
        create_tables()
        ensure_flask_secret_key()
    app.run(host="0.0.0.0", port=5050)
