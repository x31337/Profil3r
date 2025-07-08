"""
Report Module
Handles reporting functionalities across various platforms.
"""

import time
import random
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class ReportManager:
    """Manage reports for various social media accounts."""
    
    def __init__(self, config=None):
        """Initialize report manager with configuration."""
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
                logging.FileHandler('report_manager.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_driver(self, headless=True):
        """Setup Selenium WebDriver."""
        try:
            options = Options()
            if headless:
                options.add_argument("--headless")
            self.driver = webdriver.Chrome(options=options)
            return True
        except Exception as e:
            self.logger.error(f"Error setting up driver: {e}")
            return False
    
    def report_account(self, account_url, reason="spam", platform="facebook"):
        """Report an account on specified platform for given reason."""
        if not self.logged_in:
            self.logger.error("Not logged in")
            return False
        
        try:
            if platform.lower() == "facebook":
                return self._report_facebook_account(account_url, reason)
            else:
                self.logger.error(f"Platform {platform} not supported")
                return False
        except Exception as e:
            self.logger.error(f"Error reporting account: {e}")
            return False
    
    def _report_facebook_account(self, account_url, reason):
        """Report a Facebook account."""
        try:
            self.driver.get(account_url)
            time.sleep(3)
            
            # Open profile's context menu
            menu_button = self.safe_find_element(By.XPATH, "//div[@aria-label='More']")
            if self.safe_click(menu_button):
                time.sleep(2)
                
                # Select 'Find support or report profile'
                support_option = self.safe_find_element(By.XPATH, "//span[text()='Find support or report profile']")
                if self.safe_click(support_option):
                    time.sleep(2)
                    
                    # Choose reason
                    reason_option = self.safe_find_element(By.XPATH, f"//span[text()='{reason.capitalize()}']")
                    if self.safe_click(reason_option):
                        time.sleep(2)
                        
                        # Submit report
                        submit_button = self.safe_find_element(By.XPATH, "//span[text()='Submit']")
                        if self.safe_click(submit_button):
                            time.sleep(2)
                            return True
            
            self.logger.error("Could not complete report")
            return False
            
        except Exception as e:
            self.logger.error(f"Error reporting Facebook account: {e}")
            return False
    
    def safe_find_element(self, by, value, timeout=10):
        """Safely find an element with WebDriverWait."""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except:
            self.logger.warning(f"Element not found: {value}")
            return None
    
    def safe_click(self, element):
        """Safely click on an element."""
        try:
            if element:
                element.click()
                return True
        except Exception as e:
            self.logger.error(f"Error clicking element: {e}")
        return False
    
    def login(self, email, password, platform="facebook"):
        """Login to specified platform."""
        try:
            if platform.lower() == "facebook":
                return self._facebook_login(email, password)
            else:
                self.logger.error(f"Platform {platform} not supported")
                return False
        except Exception as e:
            self.logger.error(f"Error logging in: {e}")
            return False
    
    def _facebook_login(self, email, password):
        """Login to Facebook."""
        try:
            self.driver.get("https://www.facebook.com/")
            time.sleep(3)
            
            email_field = self.safe_find_element(By.ID, "email")
            pass_field = self.safe_find_element(By.ID, "pass")
            
            if email_field and pass_field:
                email_field.send_keys(email)
                pass_field.send_keys(password)
                
                login_button = self.safe_find_element(By.NAME, "login")
                if self.safe_click(login_button):
                    time.sleep(5)
                    self.logged_in = True
                    return True
            
            self.logger.error("Login failed")
            return False
            
        except Exception as e:
            self.logger.error(f"Error in Facebook login: {e}")
            return False
    
    def cleanup(self):
        """Clean up and close browser."""
        if self.driver:
            self.driver.quit()
            self.driver = None
        self.logged_in = False
    
    def __enter__(self):
        """Context management entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context management exit."""
        self.cleanup()


class ReportReasonGenerator:
    """Generate report reasons dynamically."""
    
    @staticmethod
    def generate_reason():
        """Generate random report reason."""
        reasons = [
            "Spam", "Harassment", "Fake Account", "Illegal Activity",
            "Misinformation", "Violence", "Hate Speech"
        ]
        return random.choice(reasons)
