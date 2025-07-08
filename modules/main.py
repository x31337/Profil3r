"""
Main Module
Integrates all Pr0f1l3r functionalities into a unified interface.
"""

import sys
import json
import logging
from pathlib import Path

# Import our modules
from .login import LoginManager
from .create import AccountCreator, ProfileGenerator
from .interact import SocialInteractor, ContentGenerator
from .report import ReportManager, ReportReasonGenerator
from .facebook_automation import FacebookAutomation

class Pr0f1l3rMain:
    """Main class that coordinates all modules."""
    
    def __init__(self, config_file="config.json"):
        """Initialize main controller."""
        self.config = self.load_config(config_file)
        self.setup_logging()
        
        # Initialize modules
        self.login_manager = LoginManager()
        self.account_creator = AccountCreator(self.config)
        self.social_interactor = SocialInteractor(self.config)
        self.report_manager = ReportManager(self.config)
        self.facebook_automation = None
        
        self.logger.info("Pr0f1l3r initialized successfully")
    
    def load_config(self, config_file):
        """Load configuration from file."""
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Config file {config_file} not found. Using default settings.")
            return {}
        except json.JSONDecodeError as e:
            print(f"Error parsing config file: {e}. Using default settings.")
            return {}
    
    def setup_logging(self):
        """Setup main logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pr0f1l3r.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def display_banner(self):
        """Display application banner."""
        banner = '''
        ██████╗ ██████╗  ██████╗ ███████╗ ██╗██╗     ██████╗ ██████╗ 
        ██╔══██╗██╔══██╗██╔═████╗██╔════╝███║██║     ╚════██╗██╔══██╗
        ██████╔╝██████╔╝██║██╔██║█████╗  ╚██║██║      █████╔╝██████╔╝
        ██╔═══╝ ██╔══██╗████╔╝██║██╔══╝   ██║██║      ╚═══██╗██╔══██╗
        ██║     ██║  ██║╚██████╔╝██║      ██║███████╗██████╔╝██║  ██║
        ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝      ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝
        
        Modern Social Media Automation and Profiling Tool v2.0
        ================================================
        '''
        print(banner)
    
    def show_menu(self):
        """Display main menu."""
        menu = """
        Choose an option:
        
        [1] Account Creation
        [2] Login & Authentication  
        [3] Social Media Interactions
        [4] Reporting & Moderation
        [5] Facebook Automation Suite
        [6] Profile Discovery
        [7] Settings & Configuration
        [8] Exit
        
        Enter your choice (1-8): """
        
        return input(menu).strip()
    
    def account_creation_menu(self):
        """Handle account creation functionality."""
        print("\n=== Account Creation ===")
        choice = input("""
        1. Create single Facebook account
        2. Create multiple accounts
        3. Generate profile data only
        4. Back to main menu
        
        Choice: """).strip()
        
        if choice == "1":
            profile_data = self.account_creator.generate_profile_data()
            print(f"Generated profile: {profile_data['full_name']} ({profile_data['email']})")
            
            if input("Create account with this data? (y/n): ").lower() == 'y':
                result = self.account_creator.create_facebook_account(profile_data)
                if result:
                    print("Account creation initiated successfully!")
                    self.account_creator.save_accounts_to_file([result])
                else:
                    print("Account creation failed.")
        
        elif choice == "2":
            count = int(input("How many accounts to create? "))
            accounts = self.account_creator.create_multiple_accounts(count)
            if accounts:
                print(f"Created {len(accounts)} accounts successfully!")
                self.account_creator.save_accounts_to_file(accounts)
        
        elif choice == "3":
            count = int(input("How many profiles to generate? "))
            profiles = []
            for i in range(count):
                profile = self.account_creator.generate_profile_data()
                profiles.append(profile)
                print(f"Profile {i+1}: {profile['full_name']} - {profile['email']}")
        
        elif choice == "4":
            return
    
    def login_menu(self):
        """Handle login functionality."""
        print("\n=== Login & Authentication ===")
        choice = input("""
        1. Facebook login test
        2. Interactive login
        3. Load saved session
        4. Back to main menu
        
        Choice: """).strip()
        
        if choice == "1":
            url = input("Enter URL to test login: ")
            username = input("Username: ")
            if self.login_manager.interactive_login(url):
                print("Login successful!")
            else:
                print("Login failed.")
        
        elif choice == "2":
            self.facebook_automation = FacebookAutomation(self.config)
            if self.facebook_automation.login_facebook():
                print("Facebook login successful!")
            else:
                print("Facebook login failed.")
        
        elif choice == "3":
            self.facebook_automation = FacebookAutomation(self.config)
            if self.facebook_automation.load_session():
                print("Session loaded successfully!")
            else:
                print("Failed to load session.")
        
        elif choice == "4":
            return
    
    def interaction_menu(self):
        """Handle social media interactions."""
        print("\n=== Social Media Interactions ===")
        
        if not hasattr(self, 'facebook_automation') or not self.facebook_automation:
            print("Please login first!")
            return
        
        choice = input("""
        1. Create post
        2. Like posts
        3. Comment on posts
        4. Send messages
        5. Mass messaging
        6. Simulate human activity
        7. Back to main menu
        
        Choice: """).strip()
        
        if choice == "1":
            text = input("Enter post text: ")
            if self.social_interactor.create_post(text):
                print("Post created successfully!")
            else:
                print("Failed to create post.")
        
        elif choice == "2":
            count = int(input("How many posts to like? "))
            liked = self.social_interactor.like_posts(count)
            print(f"Liked {liked} posts.")
        
        elif choice == "3":
            count = int(input("How many posts to comment on? "))
            comments = ContentGenerator.generate_comments()
            commented = self.social_interactor.comment_on_posts(comments, count)
            print(f"Commented on {commented} posts.")
        
        elif choice == "4":
            recipient = input("Recipient username: ")
            message = input("Message text: ")
            if self.social_interactor.send_message(recipient, message):
                print("Message sent successfully!")
            else:
                print("Failed to send message.")
        
        elif choice == "5":
            recipients_file = input("Recipients file path: ")
            message_text = input("Message text: ")
            sent = self.social_interactor.mass_message(recipients_file, message_text)
            print(f"Sent {sent} messages.")
        
        elif choice == "6":
            duration = int(input("Activity duration in minutes: "))
            if self.social_interactor.simulate_human_activity(duration):
                print("Human activity simulation completed!")
            else:
                print("Human activity simulation failed.")
        
        elif choice == "7":
            return
    
    def reporting_menu(self):
        """Handle reporting functionality."""
        print("\n=== Reporting & Moderation ===")
        
        if not hasattr(self, 'facebook_automation') or not self.facebook_automation:
            print("Please login first!")
            return
        
        choice = input("""
        1. Report single account
        2. Mass report from list
        3. Report with custom reason
        4. Back to main menu
        
        Choice: """).strip()
        
        if choice == "1":
            account_url = input("Account URL to report: ")
            count = int(input("Number of reports: "))
            if self.facebook_automation.report_account(account_url, count):
                print("Account reported successfully!")
            else:
                print("Failed to report account.")
        
        elif choice == "2":
            accounts_file = input("Accounts file path: ")
            reports_per_account = int(input("Reports per account: "))
            if self.facebook_automation.mass_report_from_list(accounts_file, reports_per_account):
                print("Mass reporting completed!")
            else:
                print("Mass reporting failed.")
        
        elif choice == "3":
            account_url = input("Account URL: ")
            reason = input("Report reason: ")
            if self.report_manager.report_account(account_url, reason):
                print("Account reported with custom reason!")
            else:
                print("Failed to report account.")
        
        elif choice == "4":
            return
    
    def facebook_automation_menu(self):
        """Handle Facebook automation suite."""
        print("\n=== Facebook Automation Suite ===")
        choice = input("""
        1. Auto login and report
        2. Brute force login attempt
        3. Human activity simulation
        4. Save current session
        5. Load saved session
        6. Back to main menu
        
        Choice: """).strip()
        
        if choice == "1":
            email = input("Email: ")
            password = input("Password: ")
            account_url = input("Account URL to report: ")
            count = int(input("Number of reports: "))
            
            with FacebookAutomation(self.config) as fb:
                if fb.login_facebook(email, password):
                    if fb.report_account(account_url, count):
                        print("Auto report completed successfully!")
                    else:
                        print("Reporting failed.")
                else:
                    print("Login failed.")
        
        elif choice == "2":
            email = input("Email: ")
            password_file = input("Password file path (default: passwords.txt): ") or "passwords.txt"
            
            with FacebookAutomation(self.config) as fb:
                if fb.brute_force_login(email, password_file):
                    print("Password found!")
                else:
                    print("No password found.")
        
        elif choice == "3":
            duration = int(input("Duration in minutes: "))
            if not hasattr(self, 'facebook_automation') or not self.facebook_automation:
                self.facebook_automation = FacebookAutomation(self.config)
            
            if self.facebook_automation.simulate_human_activity(duration):
                print("Human activity simulation completed!")
        
        elif choice == "4":
            if hasattr(self, 'facebook_automation') and self.facebook_automation:
                if self.facebook_automation.save_session():
                    print("Session saved successfully!")
                else:
                    print("Failed to save session.")
            else:
                print("No active session to save.")
        
        elif choice == "5":
            self.facebook_automation = FacebookAutomation(self.config)
            if self.facebook_automation.load_session():
                print("Session loaded successfully!")
            else:
                print("Failed to load session.")
        
        elif choice == "6":
            return
    
    def profile_discovery_menu(self):
        """Handle profile discovery functionality."""
        print("\n=== Profile Discovery ===")
        print("Profile discovery functionality from original Pr0f1l3r")
        
        # Import original profil3r functionality
        try:
            from profil3r.core import Core
            core = Core('./config.json')
            core.run()
        except ImportError:
            print("Original Pr0f1l3r modules not found. Please ensure they are installed.")
    
    def settings_menu(self):
        """Handle settings and configuration."""
        print("\n=== Settings & Configuration ===")
        choice = input("""
        1. View current configuration
        2. Update configuration
        3. Reset to defaults
        4. Back to main menu
        
        Choice: """).strip()
        
        if choice == "1":
            print(json.dumps(self.config, indent=2))
        
        elif choice == "2":
            print("Configuration update not implemented yet.")
        
        elif choice == "3":
            print("Reset to defaults not implemented yet.")
        
        elif choice == "4":
            return
    
    def run(self):
        """Main application loop."""
        self.display_banner()
        
        while True:
            try:
                choice = self.show_menu()
                
                if choice == "1":
                    self.account_creation_menu()
                elif choice == "2":
                    self.login_menu()
                elif choice == "3":
                    self.interaction_menu()
                elif choice == "4":
                    self.reporting_menu()
                elif choice == "5":
                    self.facebook_automation_menu()
                elif choice == "6":
                    self.profile_discovery_menu()
                elif choice == "7":
                    self.settings_menu()
                elif choice == "8":
                    print("Goodbye!")
                    break
                else:
                    print("Invalid choice. Please try again.")
            
            except KeyboardInterrupt:
                print("\nExiting...")
                break
            except Exception as e:
                self.logger.error(f"Unexpected error: {e}")
                print(f"An error occurred: {e}")
        
        # Cleanup
        if hasattr(self, 'facebook_automation') and self.facebook_automation:
            self.facebook_automation.cleanup()
        
        self.account_creator.cleanup()
        self.social_interactor.cleanup()
        self.report_manager.cleanup()


def main():
    """Entry point for the application."""
    app = Pr0f1l3rMain()
    app.run()


if __name__ == "__main__":
    main()
