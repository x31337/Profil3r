# Comprehensive Facebook & OSINT Automation Toolkit

This repository is a consolidated collection of tools for Facebook automation, OSINT gathering, and other network utilities. It merges functionalities from various scripts and projects into a more organized and modernized structure.

## Overview

The primary goal of this refactoring is to:
*   **Consolidate Duplicate Logic:** Merge similar functionalities from scattered scripts into unified Python modules.
*   **Modernize Code:** Update older code to use current best practices, libraries, and error handling.
*   **Organize by Functionality:** Group tools and scripts based on their purpose (e.g., Facebook automation, OSINT, network utilities, JavaScript tools).

## Core Python Modules (`modules/`)

The main Python-based tools are now organized within the `modules/` directory:

*   **`modules/facebook_automation.py`:**
    *   Provides the `FacebookAutomation` class for comprehensive Facebook interactions.
    *   Supports Selenium-based UI automation for login, posting, liking, commenting, reporting, messaging, friending, profile visits, and activity simulation.
    *   Includes methods for interacting with the Facebook Graph API (user info, friends list, token management) using `requests` and cookie-based sessions.
    *   Features for Selenium session saving/loading and cookie injection.
    *   Includes brute-force login capabilities (both Selenium and `requests`-based).
    *   Uses `FacebookInteractionHelper` for generating sample content.

*   **`modules/osint_utils.py`:**
    *   Provides the `OsintUtilities` class for various open-source intelligence tasks.
    *   Includes username reconnaissance across multiple platforms, email finding by name (with API-based validation), GitHub user information lookup, and temporary email generation/checking.

*   **`modules/network_utils.py`:**
    *   Provides the `NetworkUtilities` class for network-related tasks.
    *   Includes IP geolocation, domain information via HackerTarget (DNS lookup, WHOIS, etc.), phone number validation/info via VeriPhone, Google Dorking, and Bitly URL bypassing.

*   **`modules/main.py` (`UnifiedCliApp`):**
    *   A central command-line interface (CLI) to access the functionalities of the above modules.
    *   Run interactively: `python -m modules.main` (or `python modules/main.py` from the root).
    *   Loads configuration from `config.json`.

## Other Tools

### Profil3r (`profil3r/`)
*   The original Profil3r OSINT tool for finding social network profiles and email addresses.
*   It remains largely in its original structure.
*   Can be invoked via the `UnifiedCliApp` in `modules/main.py` or potentially run directly as per its own documentation (`python profil3r.py ...`).

### JavaScript Tools (`js_tools/`)
This directory contains JavaScript-based applications and scripts, organized by type:
*   **`js_tools/facebook_mass_messenger/`**: A Node.js application for sending mass messages via a web interface. (Original: `facebook-mass-message/`)
*   **`js_tools/messenger_bot_framework/`**: Contains `fbbot`, a Node.js library for creating Facebook Messenger bots. (Original: `fbbot/`)
*   **`js_tools/browser_enhancements/`**: Intended for user scripts. Currently holds information for `fb-ban-dsd.user.js`, a script for adding ban/unban UI elements to Facebook groups. (Original: `fb-ban-dsd.user.js` at root - note: encountered sandbox issues moving this file).

### PHP Scripts (`php_tools/facebook_scripts/`)
*   A collection of older PHP scripts for various Facebook interactions (account management, token handling, page creation, etc.).
*   These are preserved for reference. Most of their intended functionalities are now covered by the Python `FacebookAutomation` module.
*   (Original: `facebook/` directory - note: encountered sandbox issues deleting this original directory after content copy).

### Ruby Script (at root)
*   `ruby_tool_faceports_reporter_run.rb` (with `ruby_tool_faceports_reporter_README.md`): A Ruby script using `mechanize` for Facebook login and reporting.
*   Its functionality is largely superseded by the Python `FacebookAutomation` module.
*   (Original: `faceports/` directory - note: recreated at root due to sandbox issues with directory creation/move for Ruby tools. Original `faceports/` directory might still exist if deletion failed).

## Configuration (`config.json`)

A central `config.json` file (expected at the root of the project or next to `modules/main.py`) is used to configure:
*   API keys (e.g., for RealEmail, VeriPhone, GitHub).
*   Default paths (e.g., cookie files, session files, log directory).
*   Behavioral parameters for automation (e.g., wait times, log levels).
*   An example `config.json` might look like:
    ```json
    {
        "log_level": "INFO",
        "log_directory": "logs",
        "cli_log_filename": "unified_cli.log",
        "cookie_file_path": ".fb_cookies.json",
        "selenium_session_file": "facebook_selenium_session.json",
        "REALEMAIL_API_KEY": "YOUR_REALEMAIL_API_KEY_HERE",
        "VERIPHONE_API_KEY": "YOUR_VERIPHONE_API_KEY_HERE",
        "GITHUB_TOKEN": "YOUR_GITHUB_TOKEN_HERE_OR_BLANK",
        "default_fb_email": "",
        "headless": false,
        "browser": "chrome",
        "profil3r_config_path": "profil3r/config.json",
        "wait_general_min": 1.5,
        "wait_general_max": 3.5
    }
    ```

## Setup & Usage

1.  **Clone the repository.**
2.  **Install Python dependencies:**
    *   A `requirements.txt` will be provided in the `modules/` directory. Install with `pip install -r modules/requirements.txt`.
    *   Key Python dependencies include `requests`, `selenium`, `beautifulsoup4`, `lxml`, `webdriver-manager` (recommended).
3.  **Install JavaScript tool dependencies:**
    *   For `js_tools/facebook_mass_messenger/`: `cd js_tools/facebook_mass_messenger && npm install`
    *   For `js_tools/messenger_bot_framework/fbbot/`: `cd js_tools/messenger_bot_framework/fbbot && npm install`
4.  **Install Ruby dependencies** (if using the Ruby script):
    *   `sudo apt install libssl-dev zlib1g-dev` (or equivalent for your OS)
    *   `sudo gem install nokogiri mechanize colorize highline optparse`
5.  **Configure `config.json`:** Create or update `config.json` in the project root with your API keys and desired settings.
6.  **Run the main CLI:**
    *   `python -m modules.main` (from the project root)
    *   Or `python path/to/your/clone/modules/main.py`
    *   Follow the interactive prompts.

## Disclaimer

These tools are provided for educational and analytical purposes. Interacting with platforms like Facebook programmatically may violate their Terms of Service. Users are responsible for ensuring their use of these tools is compliant with all applicable laws and platform policies. The developers assume no liability for misuse.

## Sandbox Anomalies Encountered During Refactoring
This refactoring was performed in a sandboxed environment that exhibited several anomalies with file and directory operations (renaming, moving, deleting). As a result:
*   The original `facebook/` (PHP scripts) and `faceports/` (Ruby script) directories might still exist at the root, even though their contents were moved or recreated elsewhere. Attempts to delete these empty or original directories consistently failed.
*   The `fb-ban-dsd.user.js` file also faced issues and its final location/status at the root is uncertain due to these errors; its documentation is placed in `js_tools/browser_enhancements/`.

These issues are environmental and do not reflect the intended final state of a clean file system. The organized versions of the scripts are in their respective `*_tools/` or `modules/` directories.
