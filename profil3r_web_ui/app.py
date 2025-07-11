from flask import Flask, render_template, request, redirect, url_for, send_from_directory
import os
import uuid
import sys

# --- Add Profil3r to Python Path ---
# This assumes the 'profil3r_web_ui' directory is at the same level as the 'profil3r' directory
# and the main 'profil3r.py' script.
# Adjust if your directory structure is different.
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
# Add parent_dir to sys.path to allow importing 'profil3r'
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
# Now you can import from profil3r
from profil3r.core import Core
# --- End Profil3r Path Setup ---

app = Flask(__name__)

# --- Configuration ---
# Directory to store generated reports
REPORTS_DIR = os.path.join(current_dir, "reports")
# Path to Profil3r's main configuration file
PROFIL3R_CONFIG_PATH = os.path.join(parent_dir, "config.json") # Assumes config.json is in the parent directory

if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR)
app.config["REPORTS_DIR"] = REPORTS_DIR

if not os.path.exists(PROFIL3R_CONFIG_PATH):
    # This is a critical error, the app can't run without Profil3r's config
    print(f"CRITICAL ERROR: Profil3r config.json not found at {PROFIL3R_CONFIG_PATH}")
    # In a real app, you might exit or raise a more specific Flask error
    # For now, printing and letting it potentially fail later if Core() needs it immediately.
# --- End Configuration ---


@app.route("/", methods=["GET"])
def index():
    report_filename = request.args.get("report_filename")
    error_message = request.args.get("error_message")
    processing = request.args.get("processing") # For showing loader
    return render_template("index.html", report_filename=report_filename, error_message=error_message, processing=processing)

@app.route("/run", methods=["POST"])
def run_profil3r_route(): # Renamed to avoid conflict if 'run_profil3r' is a function name elsewhere
    profiles_input = request.form.get("profiles")
    if not profiles_input:
        return redirect(url_for("index", error_message="No profiles provided."))

    # Split by newline, then by space, and filter out empty strings
    profiles_list = [item.strip() for line in profiles_input.splitlines() for item in line.split(' ') if item.strip()]

    if not profiles_list:
        return redirect(url_for("index", error_message="No valid profiles provided after parsing."))

    # Generate a unique filename for the report
    report_basename = f"profil3r_report_{uuid.uuid4().hex}.html"
    # Full path where the report will be saved
    report_output_filepath = os.path.join(app.config["REPORTS_DIR"], report_basename)

    try:
        # Initialize Profil3r Core
        # Make sure PROFIL3R_CONFIG_PATH is correct and accessible
        core_instance = Core(config_path=PROFIL3R_CONFIG_PATH)

        # Run Profil3r with the provided profiles, specifying the output path for the HTML report,
        # and in non-interactive mode.
        # The refactored Core.run should handle setting items, skipping menu, etc.
        print(f"Running Profil3r for: {profiles_list}")
        print(f"Report will be saved to: {report_output_filepath}")

        # The `run` method was refactored to accept profiles_list, html_report_filepath, and interactive flag
        actual_report_path = core_instance.run(
            profiles_list=profiles_list,
            html_report_filepath=report_output_filepath,
            interactive=False
        )

        if actual_report_path and os.path.exists(actual_report_path):
            # Pass the basename of the report for the download link
            return redirect(url_for("index", report_filename=os.path.basename(actual_report_path)))
        else:
            print(f"Profil3r ran, but report file not found at expected path: {actual_report_path}")
            return redirect(url_for("index", error_message="Profil3r ran, but the report file was not found."))

    except ValueError as ve: # Catch specific errors from Profil3r run
        print(f"ValueError during Profil3r execution: {ve}")
        return redirect(url_for("index", error_message=str(ve)))
    except FileNotFoundError as fnfe:
        print(f"FileNotFoundError during Profil3r execution (e.g., config.json missing?): {fnfe}")
        return redirect(url_for("index", error_message=f"A required file was not found: {fnfe}"))
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"An unexpected error occurred during Profil3r execution: {e}")
        traceback.print_exc()
        return redirect(url_for("index", error_message=f"An unexpected error occurred: {str(e)}"))

@app.route("/reports/<filename>")
def download_report(filename):
    return send_from_directory(app.config["REPORTS_DIR"], filename, as_attachment=True)

if __name__ == "__main__":
    # The sys.path modification is now at the top of the file.
    app.run(debug=True, host="0.0.0.0", port=5001)
