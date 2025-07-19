import json
import os
import shutil

# Assuming modules.facebook_automation is accessible in PYTHONPATH
# For development, you might need to adjust sys.path or structure
import sys
import threading
import time
import uuid

from flask import Flask, jsonify, render_template, request
from werkzeug.utils import secure_filename

# Add project root to sys.path to allow importing modules.facebook_automation
# This is a common way to handle imports in Flask apps when the app is not installed as a package
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from modules.facebook_automation import (
        FacebookAutomation,
        FacebookInteractionHelper,
    )
except ImportError:
    # This is a fallback if the above path adjustment doesn't work in all execution contexts
    # Or if there's an issue finding the module.
    # For the agent's environment, this might be tricky.
    # A more robust solution in a real project would be proper packaging or setting PYTHONPATH externally.
    print(
        "Error: Could not import FacebookAutomation. Ensure 'modules' directory is in PYTHONPATH."
    )
    print(f"Current sys.path: {sys.path}")
    print(f"PROJECT_ROOT: {PROJECT_ROOT}")

    # Define a mock class if import fails, so the app can still start for basic UI dev
    class FacebookAutomation:
        def __init__(self, config=None):
            self.logger = lambda x: print(f"MockFBLog: {x}")
            print("MockFacebookAutomation initialized")

        def login_with_cookies(self, cookie_input=None):
            return True  # Mock success

        def report_content(
            self, target_url, justification_text, evidence_paths=None, report_count=1
        ):
            self.logger(
                f"Mock reporting {target_url} with justification '{justification_text}'"
            )
            time.sleep(2)  # Simulate work
            return {
                "success": True,
                "message": f"Mock reported {target_url} successfully.",
            }

        def cleanup(self):
            self.logger("Mock cleanup called.")

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            self.cleanup()

    class FacebookInteractionHelper:  # Mock if needed
        pass


app = Flask(__name__)
app.secret_key = (
    "your_very_secret_key_for_flask_sessions_or_other_features"  # Change in production
)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "gif",
    "txt",
    "mp4",
}  # Example, adjust as needed

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB limit for uploads

# Global state for managing reporting
reporting_status = {
    "active": False,
    "stop_requested": False,
    "logs": [],
    "summary": {
        "total_targets": 0,
        "processed_targets": 0,
        "successful_reports": 0,
        "failed_reports": 0,
        "details": [],  # List of {"target_url", "account_alias", "status", "message"}
    },
    "current_thread": None,
}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def clear_uploads_folder():
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            log_message(f"Failed to delete {file_path}. Reason: {e}")


def log_message(message_type, message, account_alias=None, target_url=None):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}]"
    if account_alias:
        log_entry += f" [{account_alias}]"
    if target_url:
        log_entry += f" [Target: {target_url[:50]}...]"
    log_entry += f" [{message_type.upper()}]: {message}"

    print(log_entry)  # Server console log
    reporting_status["logs"].append(log_entry)
    # Keep logs to a reasonable size if needed, e.g., last 1000 lines
    reporting_status["logs"] = reporting_status["logs"][-1000:]


def reporting_thread_function(
    accounts_data, targets, justification, evidence_files_info
):
    reporting_status["active"] = True
    reporting_status["stop_requested"] = False
    reporting_status["logs"] = ["Reporting process started..."]
    reporting_status["summary"] = {
        "total_targets": len(targets) * len(accounts_data),
        "processed_targets": 0,
        "successful_reports": 0,
        "failed_reports": 0,
        "details": [],
    }

    total_reports_to_make = len(targets) * len(accounts_data)

    log_message(
        "INFO",
        f"Starting reporting for {len(targets)} targets using {len(accounts_data)} accounts.",
    )

    for acc_index, account in enumerate(accounts_data):
        if reporting_status["stop_requested"]:
            log_message(
                "INFO", "Stop requested. Halting reporting for current account."
            )
            break

        cookies = account.get("cookieData")
        alias = account.get("alias", f"Account-{acc_index+1}")
        log_message("INFO", f"Processing with account: {alias}", account_alias=alias)

        fb_config = {
            "headless": True,  # Always headless for server-side automation
            "browser": "chrome",  # or "firefox" - ensure it's installed in Docker
            "log_level": "INFO",  # For FacebookAutomation internal logs
            "cookie_file_path": None,  # We are passing cookies directly
        }

        try:
            with FacebookAutomation(config=fb_config) as fb_instance:
                log_message("INFO", "Initializing WebDriver...", account_alias=alias)
                # The setup_driver is usually called by login or report_content if driver is None
                # We are using cookie login which might not setup driver immediately.
                # Let's ensure driver is setup before attempting to use cookies for it.
                if not fb_instance.setup_driver(
                    headless=True, browser_type=fb_config["browser"]
                ):
                    log_message(
                        "ERROR", "Failed to setup WebDriver.", account_alias=alias
                    )
                    reporting_status["summary"]["failed_reports"] += len(
                        targets
                    )  # All targets for this account fail
                    reporting_status["summary"]["processed_targets"] += len(targets)
                    reporting_status["summary"]["details"].extend(
                        [
                            {
                                "target_url": target_url,
                                "account_alias": alias,
                                "status": "Error",
                                "message": "WebDriver setup failed",
                            }
                            for target_url in targets
                        ]
                    )
                    continue  # Try next account

                log_message(
                    "INFO", "Attempting to login with cookies...", account_alias=alias
                )
                # The login_with_cookies in FacebookAutomation should handle injecting to selenium if driver is present
                if not fb_instance.login_with_cookies(cookie_input=cookies):
                    log_message("ERROR", "Cookie login failed.", account_alias=alias)
                    reporting_status["summary"]["failed_reports"] += len(targets)
                    reporting_status["summary"]["processed_targets"] += len(targets)
                    reporting_status["summary"]["details"].extend(
                        [
                            {
                                "target_url": target_url,
                                "account_alias": alias,
                                "status": "Error",
                                "message": "Cookie login failed",
                            }
                            for target_url in targets
                        ]
                    )
                    continue  # Try next account

                log_message("INFO", "Cookie login successful.", account_alias=alias)

                for target_url in targets:
                    if reporting_status["stop_requested"]:
                        log_message(
                            "INFO",
                            "Stop requested. Halting reporting for current target.",
                            account_alias=alias,
                            target_url=target_url,
                        )
                        break  # Break from targets loop

                    log_message(
                        "INFO",
                        f"Attempting to report: {target_url}",
                        account_alias=alias,
                        target_url=target_url,
                    )

                    # Prepare evidence paths for this specific call
                    current_evidence_paths = [
                        ef_info["path"] for ef_info in evidence_files_info
                    ]

                    report_result = fb_instance.report_content(
                        target_url=target_url,
                        justification_text=justification,
                        evidence_paths=current_evidence_paths,
                    )

                    reporting_status["summary"]["processed_targets"] += 1
                    if report_result.get("success"):
                        reporting_status["summary"]["successful_reports"] += 1
                        log_message(
                            "SUCCESS",
                            f"Reported: {report_result.get('message', 'Success')}",
                            account_alias=alias,
                            target_url=target_url,
                        )
                        reporting_status["summary"]["details"].append(
                            {
                                "target_url": target_url,
                                "account_alias": alias,
                                "status": "Success",
                                "message": report_result.get("message"),
                            }
                        )
                    else:
                        reporting_status["summary"]["failed_reports"] += 1
                        log_message(
                            "FAILURE",
                            f"Failed to report: {report_result.get('message', 'Unknown error')}",
                            account_alias=alias,
                            target_url=target_url,
                        )
                        reporting_status["summary"]["details"].append(
                            {
                                "target_url": target_url,
                                "account_alias": alias,
                                "status": "Failure",
                                "message": report_result.get("message"),
                            }
                        )
        except Exception as e:
            log_message(
                "CRITICAL",
                f"Unhandled exception during reporting with account {alias}: {str(e)}",
                account_alias=alias,
            )
            reporting_status["summary"]["failed_reports"] += len(targets) - (
                reporting_status["summary"]["processed_targets"] % len(targets)
                if len(targets) > 0
                else 0
            )  # Estimate remaining targets for this account as failed
            reporting_status["summary"]["processed_targets"] = reporting_status[
                "summary"
            ][
                "total_targets"
            ]  # Mark as processed to avoid negative counts
            reporting_status["summary"]["details"].extend(
                [
                    {
                        "target_url": t_url,
                        "account_alias": alias,
                        "status": "Critical Error",
                        "message": str(e),
                    }
                    for t_url in targets  # Mark all targets for this account as failed due to critical error
                ]
            )
        finally:
            log_message(
                "INFO", f"Finished processing for account: {alias}", account_alias=alias
            )
            # fb_instance.cleanup() is handled by context manager ('with')

        if reporting_status["stop_requested"]:
            log_message("INFO", "Stop requested. Exiting main reporting loop.")
            break  # Break from accounts loop

    log_message("INFO", "Reporting process finished.")
    reporting_status["active"] = False
    reporting_status["stop_requested"] = False  # Reset for next run
    # Clear evidence files after the thread finishes
    clear_uploads_folder()
    log_message("INFO", "Temporary evidence files cleared.")


@app.route("/")
def index():
    # In a real app, you'd serve index.html from a templates folder
    # For now, this is a placeholder to confirm Flask is running
    return render_template("index.html")  # We'll create this file next


@app.route("/api/start-reporting", methods=["POST"])
def start_reporting():
    if reporting_status["active"]:
        return (
            jsonify({"success": False, "message": "Reporting process already active."}),
            400,
        )

    try:
        accounts_data = request.form.getlist(
            "accountsData"
        )  # Expecting JSON strings for each account
        parsed_accounts = []
        for acc_json_str in accounts_data:
            try:
                parsed_accounts.append(json.loads(acc_json_str))
            except json.JSONDecodeError:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": f"Invalid JSON in accountsData: {acc_json_str}",
                        }
                    ),
                    400,
                )

        targets_raw = request.form.get("targetUrls", "")
        targets = [url.strip() for url in targets_raw.splitlines() if url.strip()]
        justification = request.form.get("justificationText", "")

        evidence_files = request.files.getlist("evidenceFiles")

        if not parsed_accounts:
            return jsonify({"success": False, "message": "No accounts provided."}), 400
        if not targets:
            return (
                jsonify({"success": False, "message": "No target URLs provided."}),
                400,
            )
        if not justification:  # Consider if justification should be mandatory
            return (
                jsonify(
                    {"success": False, "message": "Justification text is required."}
                ),
                400,
            )

        # Clear previous uploads before saving new ones
        clear_uploads_folder()

        evidence_files_info = []
        for file in evidence_files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = (
                    str(uuid.uuid4()) + "_" + filename
                )  # Ensure unique filenames
                file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
                file.save(file_path)
                evidence_files_info.append({"name": filename, "path": file_path})
            elif file and file.filename != "":  # File provided but not allowed
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": f"File type not allowed: {file.filename}",
                        }
                    ),
                    400,
                )

        log_message(
            "INFO", f"Received {len(parsed_accounts)} accounts, {len(targets)} targets."
        )
        if evidence_files_info:
            log_message("INFO", f"Received {len(evidence_files_info)} evidence files.")

        # Start reporting in a new thread
        thread = threading.Thread(
            target=reporting_thread_function,
            args=(parsed_accounts, targets, justification, evidence_files_info),
        )
        reporting_status["current_thread"] = thread
        thread.start()

        return jsonify({"success": True, "message": "Reporting process started."})

    except Exception as e:
        log_message("ERROR", f"Error starting reporting: {str(e)}")
        return (
            jsonify(
                {"success": False, "message": f"An unexpected error occurred: {str(e)}"}
            ),
            500,
        )


@app.route("/api/status", methods=["GET"])
def get_status():
    # Return current logs and summary
    # To minimize data transfer, client could request logs since last poll, but this is simpler for now
    return jsonify(
        {
            "active": reporting_status["active"],
            "logs": reporting_status["logs"],
            "summary": reporting_status["summary"],
        }
    )


@app.route("/api/stop-reporting", methods=["POST"])
def stop_reporting():
    if not reporting_status["active"]:
        return (
            jsonify({"success": False, "message": "No reporting process is active."}),
            400,
        )

    log_message("INFO", "Stop reporting request received.")
    reporting_status["stop_requested"] = True

    # Optionally wait for the thread to finish for a short period
    # if reporting_status["current_thread"] and reporting_status["current_thread"].is_alive():
    #     reporting_status["current_thread"].join(timeout=10) # Wait up to 10s

    # The thread itself will set active to False when it exits.
    # Here we just acknowledge the request.
    return jsonify(
        {"success": True, "message": "Stop request sent. Process will halt soon."}
    )


# Placeholder for index.html - will create it properly in the frontend step
@app.route("/minimal_index_for_testing_backend")
def minimal_index():
    return """
    <h1>Test Page</h1>
    <p>If you see this, Flask is serving HTML.</p>
    <button onclick="fetchStatus()">Fetch Status</button>
    <script>
        function fetchStatus() {
            fetch('/api/status')
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
        }
    </script>
    """


if __name__ == "__main__":
    # Ensure UPLOAD_FOLDER exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(
        debug=True, host="0.0.0.0", port=5001
    )  # Using port 5001 to avoid conflict with other services
"""
Note on Python Path and `modules.facebook_automation`:
The `sys.path.insert(0, PROJECT_ROOT)` line is a common workaround for running Flask development servers
when your application isn't installed as a package. `PROJECT_ROOT` assumes `app.py` is in a subdirectory
(e.g., `fb_mass_reporter_ui`) directly under the main project directory where `modules/` also resides.

For a production deployment (e.g., with Gunicorn/uWSGI), you'd typically:
1. Install your project as a package.
2. Or, ensure PYTHONPATH is set correctly in the environment where the WSGI server runs.
3. Or, use a structure where the WSGI entry point can naturally find `modules`.

The mock `FacebookAutomation` class is a fallback if the import fails, allowing the Flask app to at least
start up so that UI development (HTML/JS/CSS) can proceed somewhat independently of solving complex
Python import issues in the agent's environment immediately. The agent should strive to make the real
import work.
"""
