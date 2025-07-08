"""
Create Module
Handles account creation, profile setup, and user management.
"""

import random
import string
import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class AccountCreator:
    """Handle account creation and profile management across platforms."""
    
    def __init__(self, config=None):
        """Initialize account creator with configuration."""
        self.config = config or {}
        self.driver = None
        self.setup_logging()
    
    def setup_logging(self):
        """Setup logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('account_creator.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def generate_username(self, base_name=None, length=8):
        """Generate random username."""
        if base_name:
            suffix = ''.join(random.choices(string.digits, k=4))
            return f"{base_name}{suffix}"
        
        chars = string.ascii_lowercase + string.digits
        return ''.join(random.choices(chars, k=length))
    
    def generate_email(self, username=None, domain="gmail.com"):
        """Generate email address."""
        if not username:
            username = self.generate_username()
        return f"{username}@{domain}"
    
    def generate_password(self, length=12):
        """Generate secure password."""
        chars = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(random.choices(chars, k=length))
    
    def generate_profile_data(self):
        """Generate complete profile data."""
        first_names = ["Alex", "Jordan", "Casey", "Morgan", "Taylor", "Riley", "Avery", "Cameron"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
        
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        username = self.generate_username(first_name.lower())
        
        return {
            'first_name': first_name,
            'last_name': last_name,
            'full_name': f"{first_name} {last_name}",
            'username': username,
            'email': self.generate_email(username),
            'password': self.generate_password(),
            'birth_year': random.randint(1990, 2000),
            'birth_month': random.randint(1, 12),
            'birth_day': random.randint(1, 28)
        }
    
    def setup_driver(self, headless=True):
        """Setup Chrome WebDriver."""
        try:
            chrome_options = Options()
            if headless:
                chrome_options.add_argument("--headless")
            
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            
            self.driver = webdriver.Chrome(options=chrome_options)
            return True
        except Exception as e:
            self.logger.error(f"Failed to setup WebDriver: {e}")
            return False
    
    def create_facebook_account(self, profile_data=None):
        """Create Facebook account with provided or generated data."""
        if not profile_data:
            profile_data = self.generate_profile_data()
        
        if not self.driver:
            if not self.setup_driver():
                return False
        
        try:
            self.driver.get("https://www.facebook.com/")
            time.sleep(3)
            
            # Fill registration form
            first_name_field = self.driver.find_element(By.NAME, "firstname")
            first_name_field.send_keys(profile_data['first_name'])
            
            last_name_field = self.driver.find_element(By.NAME, "lastname")
            last_name_field.send_keys(profile_data['last_name'])
            
            email_field = self.driver.find_element(By.NAME, "reg_email__")
            email_field.send_keys(profile_data['email'])
            
            password_field = self.driver.find_element(By.NAME, "reg_passwd__")
            password_field.send_keys(profile_data['password'])
            
            # Set birthday
            birth_month = self.driver.find_element(By.NAME, "birthday_month")
            birth_month.send_keys(str(profile_data['birth_month']))
            
            birth_day = self.driver.find_element(By.NAME, "birthday_day")
            birth_day.send_keys(str(profile_data['birth_day']))
            
            birth_year = self.driver.find_element(By.NAME, "birthday_year")
            birth_year.send_keys(str(profile_data['birth_year']))
            
            # Select gender (randomly)
            gender = random.choice(["1", "2"])  # 1=Female, 2=Male
            gender_field = self.driver.find_element(By.XPATH, f"//input[@value='{gender}']")
            gender_field.click()
            
            # Submit form
            submit_button = self.driver.find_element(By.NAME, "websubmit")
            submit_button.click()
            
            time.sleep(5)
            
            self.logger.info(f"Account creation attempted for {profile_data['email']}")
            return profile_data
            
        except Exception as e:
            self.logger.error(f"Error creating Facebook account: {e}")
            return False
    
    def create_multiple_accounts(self, count=5, platform="facebook"):
        """Create multiple accounts."""
        created_accounts = []
        
        for i in range(count):
            self.logger.info(f"Creating account {i+1}/{count}")
            
            if platform.lower() == "facebook":
                account = self.create_facebook_account()
                if account:
                    created_accounts.append(account)
            
            # Wait between creations to avoid detection
            time.sleep(random.randint(30, 60))
        
        return created_accounts
    
    def save_accounts_to_file(self, accounts, filename="created_accounts.txt"):
        """Save created accounts to file."""
        try:
            with open(filename, 'w') as f:
                f.write("Created Accounts:\n")
                f.write("=" * 50 + "\n")
                
                for i, account in enumerate(accounts, 1):
                    f.write(f"\nAccount {i}:\n")
                    f.write(f"Name: {account['full_name']}\n")
                    f.write(f"Username: {account['username']}\n")
                    f.write(f"Email: {account['email']}\n")
                    f.write(f"Password: {account['password']}\n")
                    f.write("-" * 30 + "\n")
            
            self.logger.info(f"Accounts saved to {filename}")
            return True
        except Exception as e:
            self.logger.error(f"Error saving accounts: {e}")
            return False
    
    def cleanup(self):
        """Clean up resources."""
        if self.driver:
            self.driver.quit()
            self.driver = None


class ProfileGenerator:
    """Generate realistic profile information."""
    
    @staticmethod
    def generate_bio():
        """Generate random bio."""
        bios = [
            "Living my best life 🌟",
            "Adventure seeker and coffee lover ☕",
            "Making memories one day at a time",
            "Passionate about photography and travel 📸",
            "Fitness enthusiast and food lover",
            "Dreamer, believer, achiever ✨",
            "Life is beautiful, enjoy every moment",
            "Building my empire one step at a time"
        ]
        return random.choice(bios)
    
    @staticmethod
    def generate_interests():
        """Generate random interests."""
        interests = [
            "Photography", "Travel", "Music", "Movies", "Books", "Sports",
            "Cooking", "Art", "Technology", "Gaming", "Fitness", "Fashion",
            "Nature", "Animals", "Dancing", "Writing", "Science", "History"
        ]
        return random.sample(interests, random.randint(3, 6))
    
    @staticmethod
    def generate_location():
        """Generate random location."""
        cities = [
            "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
            "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
            "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL"
        ]
        return random.choice(cities)
