"""
OSINT Utilities Module
Provides various OSINT gathering capabilities like username reconnaissance, email finding, etc.
"""
import requests
import json
import os
import random
import re
import time # Added time for potential delays
from threading import Thread
from time import sleep # Already present, kept for consistency if used by moved code

# Assuming a central configuration mechanism will be available,
# or API keys will be passed directly to methods/class.

# Placeholder for color codes if direct printing is kept, otherwise remove.
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
WHITE = "\033[0m"

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
}

# API URLs that were global in E4GL30S1NT, might be better as class consts or config
REALEMAIL_API_URL = "https://isitarealemail.com/api/email/validate"
GITHUB_API_URL = "https://api.github.com/users/{}"
TEMPMAIL_API_URL = "https://www.1secmail.com/api/v1/" # Base URL for 1secmail

class OsintUtilities:
    def __init__(self, config=None, logger=None):
        self.config = config if config is not None else {}
        self.logger = logger if logger is not None else logging.getLogger(__name__)
        if not logger: # Basic config if no logger passed
            logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            self.logger = logging.getLogger(__name__)

        self.realemail_api_key = self.config.get("REALEMAIL_API_KEY")
        self.github_token = self.config.get("GITHUB_TOKEN") # Optional, for higher rate limits

    def _send_recon_request(self, url_template, username, results_list, platform_name):
        """
        Helper to send a request for user reconnaissance.
        Modifies results_list in place.
        """
        url = url_template.format(username)
        try:
            response = requests.get(url, headers=DEFAULT_HEADERS, timeout=self.config.get("recon_timeout", 10))
            if response.status_code == 200:
                self.logger.info(f"Found '{username}' on {platform_name}: {url}")
                results_list.append({"platform": platform_name, "url": url, "status": "found", "http_status": response.status_code})
            elif response.status_code == 404:
                self.logger.debug(f"'{username}' not found on {platform_name} (404): {url}")
                results_list.append({"platform": platform_name, "url": url, "status": "not_found", "http_status": response.status_code})
            else:
                self.logger.debug(f"Possible presence or issue for '{username}' on {platform_name}: {url} (Status: {response.status_code})")
                results_list.append({"platform": platform_name, "url": url, "status": "check_manually", "http_status": response.status_code})
        except requests.exceptions.Timeout:
            self.logger.warning(f"Timeout checking {platform_name} for '{username}': {url}")
            results_list.append({"platform": platform_name, "url": url, "status": "timeout"})
        except requests.exceptions.RequestException as e:
            self.logger.warning(f"Request error checking {platform_name} for '{username}': {url} - {e}")
            results_list.append({"platform": platform_name, "url": url, "status": "error", "error_message": str(e)})


    def user_reconnaissance(self, username_to_check):
        """
        Performs username reconnaissance across various platforms.
        Returns a list of dictionaries with findings.
        """
        if not username_to_check:
            self.logger.error("Username for reconnaissance cannot be empty.")
            return []

        self.logger.info(f"Starting username reconnaissance for: {username_to_check}")
        # Platform list from E4GL30S1NT, can be expanded or made configurable
        platforms = {
            "Facebook": "https://facebook.com/{}", "Instagram": "https://instagram.com/{}",
            "Twitter": "https://twitter.com/{}", "YouTube": "https://youtube.com/{}",
            "Vimeo": "https://vimeo.com/{}", "GitHub": "https://github.com/{}",
            "Pinterest": "https://pinterest.com/{}", "Flickr": "https://flickr.com/people/{}",
            "VK": "https://vk.com/{}", "About.me": "https://about.me/{}",
            "Disqus": "https://disqus.com/by/{}", "BitBucket": "https://bitbucket.org/{}/",
            "Medium": "https://medium.com/@{}", "HackerOne": "https://hackerone.com/{}",
            "Keybase": "https://keybase.io/{}", "BuzzFeed": "https://buzzfeed.com/{}",
            "SlideShare": "https://slideshare.net/{}", "Mixcloud": "https://mixcloud.com/{}",
            "SoundCloud": "https://soundcloud.com/{}", "Imgur": "https://imgur.com/user/{}",
            "Spotify": "https://open.spotify.com/user/{}", "Pastebin": "https://pastebin.com/u/{}",
            "Wattpad": "https://wattpad.com/user/{}", "Canva": "https://canva.com/{}",
            "Codecademy": "https://www.codecademy.com/profiles/{}", "Last.fm": "https://last.fm/user/{}",
            "Dribbble": "https://dribbble.com/{}", "Gravatar": "https://en.gravatar.com/{}",
            "Foursquare": "https://foursquare.com/{}", "Ello": "https://ello.co/{}",
            "AngelList": "https://angel.co/u/{}", "500px": "https://500px.com/p/{}",
            # Domain-based ones require different handling or confirmation
            # "Blogger": "https://{}.blogspot.com/", "Tumblr": "https://{}.tumblr.com/",
            # "WordPress": "https://{}.wordpress.com/",
            "Steam": "https://steamcommunity.com/id/{}",
            "Wikipedia": "https://www.wikipedia.org/wiki/User:{}",
            "Patreon": "https://www.patreon.com/{}", "Behance": "https://www.behance.net/{}",
            "Goodreads": "https://www.goodreads.com/user/show/{}", # User ID might be needed here, not just username
            "Instructables": "https://www.instructables.com/member/{}"
        }

        results = []
        threads = []
        thread_delay = self.config.get("recon_thread_delay", 0.1) # Short delay between starting threads

        for platform_name, url_template in platforms.items():
            thread = Thread(target=self._send_recon_request, args=(url_template, username_to_check, results, platform_name))
            threads.append(thread)
            thread.start()
            if thread_delay > 0: sleep(thread_delay)

        for t in threads:
            t.join(timeout=self.config.get("recon_thread_join_timeout", 15)) # Join with timeout

        self.logger.info(f"Username reconnaissance for '{username_to_check}' complete. Found on {sum(1 for r in results if r['status'] == 'found')} platforms.")
        return results

    def _check_single_email(self, email, api_key, results_list):
        """Checks a single email using RealEmail API. Modifies results_list."""
        if not api_key:
            self.logger.warning("RealEmail API key not configured. Cannot validate email.")
            results_list.append({"email": email, "status": "api_key_missing", "provider_status": "unknown"})
            return

        try:
            response = requests.get(
                REALEMAIL_API_URL,
                params={"email": email},
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=self.config.get("email_check_timeout", 10)
            )
            if response.status_code == 200:
                data = response.json()
                status = data.get("status", "unknown")
                self.logger.info(f"Email '{email}' status: {status}")
                results_list.append({"email": email, "status": "checked", "provider_status": status})
                if status == "valid":
                    return {"email": email, "status": "valid"} # Return valid email for immediate use
            else:
                self.logger.warning(f"Error validating email '{email}': HTTP {response.status_code} - {response.text[:100]}")
                results_list.append({"email": email, "status": "api_error", "http_status": response.status_code, "provider_status": "unknown"})
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Request error validating email '{email}': {e}")
            results_list.append({"email": email, "status": "request_error", "error_message": str(e), "provider_status": "unknown"})
        except json.JSONDecodeError:
            self.logger.error(f"JSON decode error for email '{email}'. Response: {response.text[:200]}")
            results_list.append({"email": email, "status": "json_error", "provider_status": "unknown"})
        return None


    def find_emails_by_name(self, full_name, email_providers=None, custom_api_key=None):
        """
        Generates potential email addresses for a given name and validates them.
        Returns a list of dictionaries with validation results.
        """
        if not full_name:
            self.logger.error("Full name cannot be empty for email finding.")
            return []

        api_key_to_use = custom_api_key or self.realemail_api_key
        if not api_key_to_use:
            self.logger.warning("RealEmail API key is not configured. Email validation will be skipped.")
            # Could still generate emails but mark them as unverified. For now, let's require API key for this function.
            return [{"error": "API key for RealEmail not configured."}]

        self.logger.info(f"Finding emails for name: {full_name}")

        if email_providers is None:
            email_providers = self.config.get("default_email_providers_for_search", [
                "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"
            ])

        name_parts = full_name.lower().split()
        if not name_parts: return []

        username_variations = set()
        # Basic variations
        username_variations.add("".join(name_parts))
        username_variations.add(f"{name_parts[0]}.{name_parts[-1]}" if len(name_parts) > 1 else name_parts[0])
        username_variations.add(f"{name_parts[0]}{name_parts[-1]}" if len(name_parts) > 1 else name_parts[0])
        username_variations.add(name_parts[0])
        if len(name_parts) > 1:
            username_variations.add(name_parts[-1])
            username_variations.add(f"{name_parts[0][0]}{name_parts[-1]}") # jsmith
            username_variations.add(f"{name_parts[0]}{name_parts[-1][0]}") # johns

        # Add numbers, common separators
        extended_variations = set(username_variations) # Start with base variations
        for user_var in username_variations:
            extended_variations.add(user_var + str(random.randint(1,99)))
            # Add more complex variations from E4GL30S1NT if desired, e.g., replacing letters with numbers
            # user_var.replace("i", "1"), user_var.replace("a", "4"), etc.

        potential_emails = [f"{user_var}@{provider}" for user_var in extended_variations for provider in email_providers]
        self.logger.info(f"Generated {len(potential_emails)} potential emails to check.")

        validation_results = []
        threads = []
        max_threads = self.config.get("email_check_max_threads", 5)

        for i, email_addr in enumerate(potential_emails):
            if i % 10 == 0 and i > 0: # Log progress
                 self.logger.debug(f"Checked {i}/{len(potential_emails)} potential emails.")

            thread = Thread(target=self._check_single_email, args=(email_addr, api_key_to_use, validation_results))
            threads.append(thread)
            thread.start()
            if len(threads) >= max_threads: # Manage thread pool
                for t in threads: t.join(timeout=self.config.get("email_check_thread_join_timeout", 15))
                threads = []
            # Small delay to avoid overwhelming the API or network
            sleep(self.config.get("email_check_api_delay", 0.2))

        for t in threads: # Join remaining threads
            t.join(timeout=self.config.get("email_check_thread_join_timeout", 15))

        valid_emails_found = [res for res in validation_results if res.get("provider_status") == "valid"]
        self.logger.info(f"Email finding complete for '{full_name}'. Found {len(valid_emails_found)} valid emails out of {len(potential_emails)} checked.")
        return validation_results # Returns all results, caller can filter for 'valid'

    def get_github_user_info(self, username):
        """Retrieves information about a GitHub user using the GitHub API."""
        if not username:
            self.logger.error("GitHub username cannot be empty.")
            return None

        url = GITHUB_API_URL.format(username)
        headers = {"Accept": "application/vnd.github.v3+json"}
        if self.github_token:
            headers["Authorization"] = f"token {self.github_token}"

        try:
            response = requests.get(url, headers=headers, timeout=self.config.get("github_api_timeout", 10))
            response.raise_for_status() # Raise HTTPError for bad responses (4XX or 5XX)
            user_data = response.json()
            self.logger.info(f"Successfully fetched GitHub info for user '{username}'.")
            return user_data
        except requests.exceptions.HTTPError as http_err:
            if http_err.response.status_code == 404:
                self.logger.info(f"GitHub user '{username}' not found.")
            else:
                self.logger.error(f"GitHub API HTTP error for '{username}': {http_err} - {response.text[:200]}")
        except requests.exceptions.RequestException as req_err:
            self.logger.error(f"GitHub API request error for '{username}': {req_err}")
        except json.JSONDecodeError:
            self.logger.error(f"Failed to decode JSON from GitHub API for '{username}'.")
        return None

    # TODO: Implement temp_mail_gen and its helpers, making them class methods
    # and ensuring they return data rather than printing/interacting via console directly.
    # This will require more significant refactoring of its internal structure.
    # For now, it's a placeholder.
    def generate_temporary_email(self, custom_name=None):
        """
        Generates a temporary email address using 1secmail.com API.
        Returns a dictionary {'email': temp_email, 'login': login, 'domain': domain} or None.
        """
        self.logger.info("Generating temporary email...")
        domain_choices = self.config.get("temp_mail_domains", ["1secmail.com", "1secmail.net", "1secmail.org"])
        domain = random.choice(domain_choices)

        if custom_name:
            login = re.sub(r'\W+', '', custom_name) # Sanitize custom name
        else:
            login = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

        temp_email = f"{login}@{domain}"

        # Verify by trying to get messages (empty list is OK for new email)
        check_url = f"{TEMPMAIL_API_URL}?action=getMessages&login={login}&domain={domain}"
        try:
            response = requests.get(check_url, timeout=self.config.get("temp_mail_api_timeout", 5))
            if response.status_code == 200: # Even an empty list is a success for creation
                self.logger.info(f"Temporary email generated: {temp_email}")
                return {"email": temp_email, "login": login, "domain": domain}
            else:
                self.logger.error(f"Failed to verify temporary email generation (HTTP {response.status_code}): {temp_email}")
        except requests.RequestException as e:
            self.logger.error(f"Error during temporary email generation for {temp_email}: {e}")
        return None

    def get_temporary_emails(self, temp_email_info, last_id_checked=0):
        """
        Fetches emails for a given temporary email address (from generate_temporary_email).
        :param temp_email_info: Dictionary from generate_temporary_email.
        :param last_id_checked: Optional, to fetch only new emails.
        :return: List of email message dictionaries.
        """
        if not temp_email_info or not all(k in temp_email_info for k in ['login', 'domain']):
            self.logger.error("Invalid temp_email_info provided.")
            return []

        login, domain = temp_email_info['login'], temp_email_info['domain']
        url = f"{TEMPMAIL_API_URL}?action=getMessages&login={login}&domain={domain}"
        messages = []
        try:
            response = requests.get(url, timeout=self.config.get("temp_mail_api_timeout", 10))
            response.raise_for_status()
            raw_messages = response.json()

            for msg_summary in raw_messages:
                if msg_summary.get('id', 0) > last_id_checked:
                    msg_id = msg_summary['id']
                    read_url = f"{TEMPMAIL_API_URL}?action=readMessage&login={login}&domain={domain}&id={msg_id}"
                    try:
                        msg_detail_res = requests.get(read_url, timeout=self.config.get("temp_mail_api_timeout", 5))
                        msg_detail_res.raise_for_status()
                        messages.append(msg_detail_res.json())
                    except Exception as e_detail:
                        self.logger.warning(f"Could not fetch detail for email ID {msg_id}: {e_detail}")
            self.logger.info(f"Fetched {len(messages)} new emails for {login}@{domain}.")
        except requests.RequestException as e:
            self.logger.error(f"Error fetching temp emails for {login}@{domain}: {e}")
        except json.JSONDecodeError:
            self.logger.error(f"JSON decode error fetching temp emails for {login}@{domain}.")
        return messages

# Need to import string for generate_temporary_email
import string

if __name__ == '__main__':
    # Basic test configuration
    test_config = {
        "log_level": "DEBUG",
        # Provide your RealEmail API key here for testing mailfinder,
        # otherwise it will be skipped or fail.
        "REALEMAIL_API_KEY": os.environ.get("REALEMAIL_API_KEY_TEST"),
        "GITHUB_TOKEN": os.environ.get("GITHUB_TOKEN_TEST") # Optional
    }

    # Setup a logger for the test script itself
    test_logger = logging.getLogger("OsintUtilsTest")
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    utils = OsintUtilities(config=test_config, logger=test_logger)

    test_logger.info("--- Testing User Reconnaissance ---")
    # test_username = "nonexistentuser123xyzabc" # Test with a likely non-existent username
    test_username = "meta" # Test with a common name
    recon_results = utils.user_reconnaissance(test_username)
    test_logger.info(f"Recon results for '{test_username}':")
    found_platforms = 0
    for res in recon_results:
        if res.get("status") == "found":
            test_logger.info(f"  Found: {res['platform']} - {res['url']}")
            found_platforms +=1
    test_logger.info(f"Total platforms found for '{test_username}': {found_platforms}")

    test_logger.info("\n--- Testing Email Finder ---")
    if utils.realemail_api_key:
        # test_name = "John Doe"
        test_name = "Elon Musk" # A more public figure for potential (though unlikely valid) hits
        email_find_results = utils.find_emails_by_name(test_name, email_providers=["gmail.com", "tesla.com", "spacex.com"])
        test_logger.info(f"Email finder results for '{test_name}':")
        valid_emails = 0
        for res in email_find_results:
            if res.get("provider_status") == "valid":
                test_logger.info(f"  Valid: {res['email']}")
                valid_emails +=1
            elif res.get("provider_status") != "unknown" and res.get("provider_status") != "api_key_missing": # Log other statuses too
                 test_logger.info(f"  {res.get('provider_status', 'error').capitalize()}: {res['email']}")
        test_logger.info(f"Total valid emails found for '{test_name}': {valid_emails}")
    else:
        test_logger.warning("Skipping Email Finder test as REALEMAIL_API_KEY is not set.")

    test_logger.info("\n--- Testing GitHub User Info ---")
    # test_github_user = "torvalds"
    test_github_user = "octocat"
    github_info = utils.get_github_user_info(test_github_user)
    if github_info:
        test_logger.info(f"GitHub info for '{test_github_user}': Name - {github_info.get('name')}, Public Repos - {github_info.get('public_repos')}")
    else:
        test_logger.info(f"Could not fetch GitHub info for '{test_github_user}'.")

    test_logger.info("\n--- Testing Temporary Email Generation ---")
    temp_email_data = utils.generate_temporary_email(custom_name="osinttest")
    if temp_email_data:
        test_logger.info(f"Generated temp email: {temp_email_data['email']}")
        time.sleep(5) # Wait a bit for potential welcome email

        test_logger.info(f"Fetching messages for {temp_email_data['email']}...")
        messages = utils.get_temporary_emails(temp_email_data)
        if messages:
            test_logger.info(f"Received {len(messages)} message(s):")
            for msg in messages:
                test_logger.info(f"  From: {msg.get('from')}, Subject: {msg.get('subject')}")
                # test_logger.debug(f"    Body: {msg.get('textBody', '')[:100]}...") # Print first 100 chars
        else:
            test_logger.info("No messages received for the temp email yet.")
    else:
        test_logger.error("Failed to generate temporary email.")

    test_logger.info("\n--- OSINT Utilities Tests Completed ---")
