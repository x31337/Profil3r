import os
from datetime import datetime

from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify(
        {
            "message": "Hello from Python Flask!",
            "service": "profil3r-python",
            "version": "1.0.0",
        }
    )


@app.route("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "service": "profil3r-python",
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.route("/info")
def info():
    return jsonify(
        {
            "python_version": os.sys.version,
            "service": "profil3r-python",
            "environment": os.environ.get("FLASK_ENV", "development"),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
