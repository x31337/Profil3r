"""
Main CLI Module
Integrates consolidated automation and utility functionalities.
"""

import argparse
import json
import logging
import os
import sys
from getpass import getpass

# Adjust import paths if necessary, assuming 'modules' is in PYTHONPATH or running with `python -m modules.main`
from .facebook_automation import FacebookAutomation, FacebookInteractionHelper
from .network_utils import NetworkUtilities
from .osint_utils import OsintUtilities

# Attempt to import profil3r for its dedicated menu option
try:
    from profil3r.profil3r import Profil3r  # Assuming this is the main class/entry

    PROFIL3R_AVAILABLE = True
except ImportError:
    PROFIL3R_AVAILABLE = False


class UnifiedCliApp:
    def __init__(self, config_file="config/config.json"):
        self.config = self._load_config(config_file)
        # Merge facebook_automation section into main config if present
        if "facebook_automation" in self.config:
            self.config.update(self.config["facebook_automation"])
        self._setup_logging()

        # Instantiate utility classes that don't manage heavy resources like browsers
        self.osint_utils = OsintUtilities(config=self.config, logger=self.logger)
        self.network_utils = NetworkUtilities(config=self.config, logger=self.logger)
        # FacebookAutomation is typically instantiated per-session using 'with'

        self.logger.info("Unified CLI App initialized.")

    def _load_config(self, config_file):
        try:
            # Try to load from project root first, then relative to this module
            path_options = [
                config_file,
                os.path.join(os.path.dirname(__file__), "..", config_file),
            ]
            resolved_path = None
            for p_opt in path_options:
                if os.path.exists(p_opt):
                    resolved_path = p_opt
                    break

            if resolved_path:
                with open(resolved_path, "r") as f:
                    return json.load(f)
            else:
                print(
                    f"Warning: Config file '{config_file}' not found in standard locations. Using empty config."
                )
                return {}
        except Exception as e:
            print(f"Error loading config '{config_file}': {e}. Using empty config.")
            return {}

    def _setup_logging(self):
        log_dir = self.config.get("log_directory", "logs")
        if not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(
            log_dir, self.config.get("cli_log_filename", "unified_cli.log")
        )

        # Clear existing root handlers to prevent duplicate outputs if re-initialized
        for handler in logging.root.handlers[:]:
            logging.root.removeHandler(handler)

        logging.basicConfig(
            level=getattr(
                logging, self.config.get("log_level", "INFO").upper(), logging.INFO
            ),
            format="%(asctime)s - %(name)s - %(levelname)s - [%(funcName)s] - %(message)s",
            handlers=[logging.FileHandler(log_file), logging.StreamHandler(sys.stdout)],
        )
        self.logger = logging.getLogger(self.__class__.__name__)

    def _get_input(self, prompt, default=None, secret=False):
        if secret:
            val = getpass(f"{prompt} ")
        else:
            val = input(f"{prompt} ")
        return val.strip() if val.strip() else default

    # --- Facebook Automation Actions ---
    def fb_login_menu(self, fb_instance):
        choice = self._get_input(
            "Login method? (1-Selenium UN/PW, 2-Cookies, 3-Load Session):", "1"
        )
        if choice == "1":
            email = self._get_input("Email:", self.config.get("default_fb_email"))
            password = self._get_input("Password:", secret=True)
            if email and password and fb_instance.login_facebook(email, password):
                self.logger.info("Facebook Selenium login successful.")
            else:
                self.logger.error("Facebook Selenium login failed.")
        elif choice == "2":
            cookie_path = self._get_input(
                "Cookie file path (leave blank for default/prompt):",
                fb_instance.cookie_file_path or None,
            )
            if fb_instance.login_with_cookies(
                cookie_path if cookie_path else None
            ):  # Pass None if blank to trigger default/prompt
                self.logger.info(
                    "Facebook login with cookies successful (for requests session)."
                )
            else:
                self.logger.error("Facebook login with cookies failed.")
        elif choice == "3":
            session_file = self.config.get(
                "selenium_session_file", "facebook_selenium_session.json"
            )
            if fb_instance.load_session(session_file):
                self.logger.info(f"Selenium session loaded from {session_file}.")
            else:
                self.logger.error("Failed to load Selenium session.")
        else:
            self.logger.warning("Invalid login choice.")

    def fb_actions_menu(self):
        self.logger.info("\n=== Facebook Actions ===")
        # Use 'with' to ensure browser cleanup
        with FacebookAutomation(config=self.config) as fb:  # fb_instance is fb here
            if not (fb.logged_in_selenium or fb.logged_in_requests):
                self.logger.info("Not logged in. Please login first.")
                self.fb_login_menu(fb)  # Prompt for login
                if not (fb.logged_in_selenium or fb.logged_in_requests):  # Check again
                    self.logger.error("Login required to perform Facebook actions.")
                    return

            action = self._get_input(
                "FB Action (post, like, comment, report, userinfo, friends, simulate, savesession, exit):",
                "exit",
            )
            if action is not None:
                action = action.lower()
            else:
                action = "exit"

            if action == "post":
                content = self._get_input(
                    "Post content:", FacebookInteractionHelper.generate_post_text()
                )
                if fb.create_post(content):
                    self.logger.info("Post created.")
                else:
                    self.logger.error("Failed to create post.")

            elif action == "like":
                count_str = self._get_input("Max likes:", "1")
                try:
                    count = int(count_str) if count_str is not None else 1
                except Exception:
                    count = 1
                fb.like_posts(max_likes=count)

            elif (
                action == "comment"
            ):  # Simplified: comments on current page or needs target
                target = self._get_input(
                    "Post URL/Element context (optional, for specific post):"
                )
                content = self._get_input(
                    "Comment text:", FacebookInteractionHelper.generate_comment_text()
                )
                fb.comment_on_posts(
                    post_urls_or_elements=[target] if target else None,
                    comments_list=[content],
                    max_comments=1,
                )

            elif action == "report":
                url = self._get_input("Account URL to report:")
                reasons = self._get_input(
                    "Report reasons (comma-separated, e.g., 'Fake account,Harassment'):"
                )
                reason_list = (
                    [r.strip() for r in reasons.split(",")] if reasons else None
                )
                if url:
                    fb.report_account(url, reason_keywords=reason_list)

            elif action == "userinfo":
                uid = self._get_input("User ID (default 'me'):", "me")
                if uid is None:
                    uid = "me"
                fields = self._get_input(
                    "Fields (e.g., id,name,email):", "id,name,email"
                )
                if fields is None:
                    fields = "id,name,email"
                info = fb.get_user_info_graph_api(user_id=uid, fields=fields)
                if info:
                    self.logger.info(
                        f"User Info for {uid}: {json.dumps(info, indent=2)}"
                    )

            elif action == "friends":
                uid = self._get_input("User ID (default 'me'):", "me")
                if uid is None:
                    uid = "me"
                limit_str = self._get_input("Limit:", "20")
                try:
                    limit = int(limit_str) if limit_str is not None else 20
                except Exception:
                    limit = 20
                friends = fb.get_friends_graph_api(user_id=uid, limit=limit)
                if friends is not None:
                    self.logger.info(
                        f"Friends of {uid} (limit {limit}): {json.dumps(friends, indent=2)}"
                    )

            elif action == "simulate":
                duration_str = self._get_input("Simulation duration (minutes):", "5")
                try:
                    duration = int(duration_str) if duration_str is not None else 5
                except Exception:
                    duration = 5
                fb.simulate_human_activity(duration_minutes=duration)

            elif action == "savesession":
                fb.save_session()

            elif action == "exit":
                return
            else:
                self.logger.warning(f"Unknown Facebook action: {action}")

    # --- OSINT Utilities Actions ---
    def osint_actions_menu(self):
        self.logger.info("\n=== OSINT Utilities ===")
        action = self._get_input(
            "OSINT Action (userrecon, emailfind, github, tempmail, exit):", "exit"
        )
        if isinstance(action, str):
            action = action.lower()
        else:
            action = "exit"

        if action == "userrecon":
            uname = self._get_input("Username for reconnaissance:")
            if uname:
                results = self.osint_utils.user_reconnaissance(uname)
            if results:
                self.logger.info(
                    f"User Recon Results:\n{json.dumps(results, indent=2)}"
                )

        elif action == "emailfind":
            name = self._get_input("Full name to find emails for:")
            if name:
                results = self.osint_utils.find_emails_by_name(name)
            if results:
                self.logger.info(
                    f"Email Finder Results:\n{json.dumps(results, indent=2)}"
                )

        elif action == "github":
            uname = self._get_input("GitHub username:")
            if uname:
                info = self.osint_utils.get_github_user_info(uname)
            if info:
                self.logger.info(
                    f"GitHub Info for {uname}:\n{json.dumps(info, indent=2)}"
                )

        elif action == "tempmail":
            custom_name = self._get_input("Custom name for temp mail (optional):")
            email_info = self.osint_utils.generate_temporary_email(custom_name or None)
            if email_info:
                self.logger.info(
                    f"Temp mail generated: {email_info['email']}. Checking for messages..."
                )
                # self.wait_random(purpose="action_confirm")  # Wait a bit for emails (commented out, not defined)
                messages = self.osint_utils.get_temporary_emails(email_info)
                if messages:
                    self.logger.info(f"Messages:\n{json.dumps(messages, indent=2)}")
                else:
                    self.logger.info("No messages found for temp mail yet.")

        elif action == "exit":
            return
        else:
            self.logger.warning(f"Unknown OSINT action: {action}")

    # --- Network Utilities Actions ---
    def network_actions_menu(self):
        self.logger.info("\n=== Network Utilities ===")
        action = self._get_input(
            "Network Action (iploc, domaininfo, phoneinfo, dork, bitly, exit):", "exit"
        ).lower()

        if action == "iploc":
            ip = self._get_input("IP Address (blank for own IP):")
            loc = self.network_utils.get_ip_location(ip or None)
            if loc:
                self.logger.info(f"IP Location:\n{json.dumps(loc, indent=2)}")

        elif action == "domaininfo":
            target = self._get_input("Domain or IP for HackerTarget:")
            scan = self._get_input("Scan type (e.g., dnslookup, whois):", "dnslookup")
            if target:
                info = self.network_utils.get_domain_info_hackertarget(target, scan)
            if info:
                self.logger.info(f"HackerTarget '{scan}' for '{target}':\n{info}")

        elif action == "phoneinfo":
            num = self._get_input("Phone number (with country code):")
            if num:
                info = self.network_utils.get_phone_info(num)
            if info:
                self.logger.info(f"Phone Info:\n{json.dumps(info, indent=2)}")

        elif action == "dork":
            query = self._get_input("Google dork query:")
            if query:
                results = self.network_utils.google_dork_search(query)
            if results:
                self.logger.info(
                    f"Google Dork Results:\n{json.dumps(results, indent=2)}"
                )

        elif action == "bitly":
            url = self._get_input("Bitly URL to bypass:")
            if url:
                info = self.network_utils.bypass_bitly_url(url)
            if info:
                self.logger.info(f"Bitly Bypass:\n{json.dumps(info, indent=2)}")

        elif action == "exit":
            return
        else:
            self.logger.warning(f"Unknown Network action: {action}")

    def run_profil3r(self):
        self.logger.info("\n=== Profil3r Full Scan ===")
        if PROFIL3R_AVAILABLE:
            try:
                # This assumes Profil3r has a CLI invokable way or a main run() method
                # We might need to adjust how Profil3r is called based on its actual structure
                # For now, let's assume it can be instantiated and run.
                # The original main.py in modules called profil3r.core.Core().run()
                # but profil3r.py itself might be the entry.

                # Option 1: If profil3r.py is the main script
                # This is tricky to call as a module directly if it uses sys.argv
                # Option 2: Use its Core class if that's the intended library usage.
                # The original `modules/main.py` used:
                # from profil3r.core import Core
                # core = Core('config/config.json') # Profil3r might need its own config path
                # core.run()

                # For now, let's try to mimic the original call more closely if the path is an issue.
                # We need to ensure config path for Profil3r is correct.
                # It might look for config in its own directory or CWD.

                # Simplest: if profil3r.py is executable and in PATH or callable via python -m
                # For now, assume it might need specific setup or direct call.
                # This part might require manual execution of profil3r by the user
                # or a more complex subprocess call if it's a standalone CLI.

                # Let's try to instantiate and run its main class if it's `Profil3r` from `profil3r.profil3r`
                profil3r_instance = Profil3r(
                    config_path=self.config.get(
                        "profil3r_config_path", "config/config.json"
                    )
                )
                profil3r_instance.run()  # Assuming it has a run method
                self.logger.info("Profil3r scan finished.")
            except Exception as e:
                self.logger.error(
                    f"Failed to run Profil3r: {e}. Ensure Profil3r is correctly installed and configured."
                )
        else:
            self.logger.warning("Profil3r module not available.")

    def display_main_menu(self):
        self.logger.info(
            """
    Main Menu:
    1. Facebook Actions
    2. OSINT Utilities
    3. Network Utilities
    4. Run Profil3r Full Scan
    5. Exit
        """
        )
        return self._get_input("Choose an option:", "5")

    def run_interactive(self):
        self.logger.info("Starting Unified CLI in interactive mode...")
        # (Banner could be displayed here)

        while True:
            choice = self.display_main_menu()
            if choice == "1":
                self.fb_actions_menu()
            elif choice == "2":
                self.osint_actions_menu()
            elif choice == "3":
                self.network_actions_menu()
            elif choice == "4":
                self.run_profil3r()
            elif choice == "5":
                self.logger.info("Exiting.")
                break
            else:
                self.logger.warning("Invalid option. Please try again.")


def main():
    # Basic argparse setup
    parser = argparse.ArgumentParser(description="Unified Automation and OSINT CLI.")
    parser.add_argument(
        "--config",
        default="config/config.json",
        help="Path to the main JSON configuration file.",
    )
    # Add more specific command-line arguments later to bypass interactive menu
    # e.g., parser.add_argument("tool", choices=["facebook", "osint", "network", "profil3r"])
    # parser.add_argument("action", help="Specific action to perform")
    # ... other args ...

    args = parser.parse_args()

    app = UnifiedCliApp(config_file=args.config)

    # For now, always run interactively. Later, can check for specific tool/action args.
    app.run_interactive()


if __name__ == "__main__":
    # Ensure the 'modules' directory is discoverable if running this script directly
    # This allows imports like 'from .facebook_automation import ...' to work
    if __package__ is None or __package__ == "":
        # Adjust path to allow sibling module imports if run as script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(script_dir)
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        # Now re-attempt imports that might have failed if modules wasn't in path
        from modules.facebook_automation import (
            FacebookAutomation,
            FacebookInteractionHelper,
        )
        from modules.network_utils import NetworkUtilities
        from modules.osint_utils import OsintUtilities

        try:
            from profil3r.profil3r import Profil3r

            PROFIL3R_AVAILABLE = True
        except ImportError:
            PROFIL3R_AVAILABLE = False

    main()
