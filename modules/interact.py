"""
Interact Module
Handles social media interactions like posting, liking, commenting, messaging.
"""

import time
import random
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class SocialInteractor:
    """Handle various social media interactions."""
    
    def __init__(self, config=None):
        """Initialize social interactor with configuration."""
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
                logging.FileHandler('social_interactor.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
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
        except:
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
    
    def create_post(self, text, platform="facebook"):
        """Create a new post on specified platform."""
        if not self.logged_in:
            self.logger.error("Not logged in")
            return False
        
        try:
            if platform.lower() == "facebook":
                return self._create_facebook_post(text)
            else:
                self.logger.error(f"Platform {platform} not supported")
                return False
        except Exception as e:
            self.logger.error(f"Error creating post: {e}")
            return False
    
    def _create_facebook_post(self, text):
        """Create Facebook post."""
        try:
            # Navigate to Facebook home
            self.driver.get("https://www.facebook.com/")
            self.wait_random(3, 5)
            
            # Find post creation area
            post_box = self.safe_find_element(
                By.XPATH,
                "//div[@role='button'][contains(@aria-label, 'What')]|//textarea[@placeholder='What\\'s on your mind']"
            )
            
            if not post_box:
                # Try alternative selector
                post_box = self.safe_find_element(
                    By.XPATH,
                    "//div[contains(@data-testid, 'status-attachment-mentions-input')]"
                )
            
            if self.safe_click(post_box):
                self.wait_random(2, 3)
                
                # Find text input area
                text_area = self.safe_find_element(
                    By.XPATH,
                    "//div[@role='textbox']|//div[@contenteditable='true']"
                )
                
                if text_area:
                    text_area.send_keys(text)
                    self.wait_random(2, 3)
                    
                    # Find and click post button
                    post_button = self.safe_find_element(
                        By.XPATH,
                        "//div[@aria-label='Post']|//span[text()='Post']"
                    )
                    
                    if self.safe_click(post_button):
                        self.logger.info("Post created successfully")
                        return True
            
            self.logger.error("Could not create post")
            return False
            
        except Exception as e:
            self.logger.error(f"Error creating Facebook post: {e}")
            return False
    
    def like_posts(self, max_likes=5, platform="facebook"):
        """Like posts on news feed."""
        if not self.logged_in:
            self.logger.error("Not logged in")
            return 0
        
        try:
            if platform.lower() == "facebook":
                return self._like_facebook_posts(max_likes)
            else:
                self.logger.error(f"Platform {platform} not supported")
                return 0
        except Exception as e:
            self.logger.error(f"Error liking posts: {e}")
            return 0
    
    def _like_facebook_posts(self, max_likes):
        """Like Facebook posts."""
        likes_count = 0
        
        try:
            # Scroll to load posts
            self.scroll_feed(3)
            
            # Find like buttons
            like_buttons = self.driver.find_elements(
                By.XPATH,
                "//div[@aria-label='Like']|//span[text()='Like']"
            )
            
            for button in like_buttons[:max_likes]:
                try:
                    if self.safe_click(button):
                        likes_count += 1
                        self.logger.info(f"Liked post {likes_count}")
                        self.wait_random(3, 8)
                except:
                    continue
            
            return likes_count
            
        except Exception as e:
            self.logger.error(f"Error liking Facebook posts: {e}")
            return likes_count
    
    def comment_on_posts(self, comments_list, max_comments=3, platform="facebook"):
        """Comment on posts."""
        if not self.logged_in:
            self.logger.error("Not logged in")
            return 0
        
        if not comments_list:
            comments_list = [
                "Great post! 👍",
                "Thanks for sharing!",
                "Love this! ❤️",
                "Awesome! 🔥",
                "So true!",
                "Amazing content!"
            ]
        
        try:
            if platform.lower() == "facebook":
                return self._comment_facebook_posts(comments_list, max_comments)
            else:
                self.logger.error(f"Platform {platform} not supported")
                return 0
        except Exception as e:
            self.logger.error(f"Error commenting on posts: {e}")
            return 0
    
    def _comment_facebook_posts(self, comments_list, max_comments):
        """Comment on Facebook posts."""
        comments_count = 0
        
        try:
            # Scroll to load posts
            self.scroll_feed(3)
            
            # Find comment buttons
            comment_buttons = self.driver.find_elements(
                By.XPATH,
                "//div[@aria-label='Comment']|//span[text()='Comment']"
            )
            
            for button in comment_buttons[:max_comments]:
                try:
                    if self.safe_click(button):
                        self.wait_random(2, 3)
                        
                        # Find comment input
                        comment_input = self.safe_find_element(
                            By.XPATH,
                            "//div[@role='textbox'][contains(@aria-label, 'comment')]"
                        )
                        
                        if comment_input:
                            comment_text = random.choice(comments_list)
                            comment_input.send_keys(comment_text)
                            comment_input.send_keys(Keys.RETURN)
                            
                            comments_count += 1
                            self.logger.info(f"Commented: {comment_text}")
                            self.wait_random(5, 10)
                except:
                    continue
            
            return comments_count
            
        except Exception as e:
            self.logger.error(f"Error commenting on Facebook posts: {e}")
            return comments_count
    
    def scroll_feed(self, scroll_count=5):
        """Scroll through social media feed."""
        try:
            body = self.driver.find_element(By.TAG_NAME, "body")
            
            for i in range(scroll_count):
                # Scroll down
                body.send_keys(Keys.PAGE_DOWN)
                self.wait_random(2, 4)
                
                # Occasionally scroll up
                if random.choice([True, False]):
                    body.send_keys(Keys.PAGE_UP)
                    self.wait_random(1, 2)
            
            # Final scroll down
            body.send_keys(Keys.PAGE_DOWN)
            self.wait_random(2, 3)
            
        except Exception as e:
            self.logger.error(f"Error scrolling feed: {e}")
    
    def send_message(self, recipient, message, platform="facebook"):
        """Send private message to user."""
        if not self.logged_in:
            self.logger.error("Not logged in")
            return False
        
        try:
            if platform.lower() == "facebook":
                return self._send_facebook_message(recipient, message)
            else:
                self.logger.error(f"Platform {platform} not supported")
                return False
        except Exception as e:
            self.logger.error(f"Error sending message: {e}")
            return False
    
    def _send_facebook_message(self, recipient, message):
        """Send Facebook message."""
        try:
            # Navigate to messages
            self.driver.get("https://www.facebook.com/messages")
            self.wait_random(3, 5)
            
            # Click new message button
            new_message_button = self.safe_find_element(
                By.XPATH,
                "//div[@aria-label='New message']|//span[text()='New message']"
            )
            
            if self.safe_click(new_message_button):
                self.wait_random(2, 3)
                
                # Find recipient input
                recipient_input = self.safe_find_element(
                    By.XPATH,
                    "//input[@placeholder='Type a name']|//input[contains(@aria-label, 'To')]"
                )
                
                if recipient_input:
                    recipient_input.send_keys(recipient)
                    self.wait_random(2, 3)
                    recipient_input.send_keys(Keys.RETURN)
                    self.wait_random(2, 3)
                    
                    # Find message input
                    message_input = self.safe_find_element(
                        By.XPATH,
                        "//div[@role='textbox'][contains(@aria-label, 'message')]"
                    )
                    
                    if message_input:
                        message_input.send_keys(message)
                        message_input.send_keys(Keys.RETURN)
                        
                        self.logger.info(f"Message sent to {recipient}")
                        return True
            
            self.logger.error("Could not send message")
            return False
            
        except Exception as e:
            self.logger.error(f"Error sending Facebook message: {e}")
            return False
    
    def follow_users(self, usernames, max_follows=10, platform="facebook"):
        """Follow/Friend users."""
        if not self.logged_in:
            self.logger.error("Not logged in")
            return 0
        
        follows_count = 0
        
        for username in usernames[:max_follows]:
            try:
                if platform.lower() == "facebook":
                    if self._add_facebook_friend(username):
                        follows_count += 1
                        self.logger.info(f"Friend request sent to {username}")
                        self.wait_random(10, 20)
            except Exception as e:
                self.logger.error(f"Error following {username}: {e}")
                continue
        
        return follows_count
    
    def _add_facebook_friend(self, username):
        """Send Facebook friend request."""
        try:
            # Navigate to user profile
            profile_url = f"https://www.facebook.com/{username}"
            self.driver.get(profile_url)
            self.wait_random(3, 5)
            
            # Find and click Add Friend button
            add_friend_button = self.safe_find_element(
                By.XPATH,
                "//div[@aria-label='Add friend']|//span[text()='Add friend']"
            )
            
            if self.safe_click(add_friend_button):
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error adding Facebook friend: {e}")
            return False
    
    def visit_profiles(self, usernames, view_time=30, platform="facebook"):
        """Visit user profiles to simulate engagement."""
        if not self.logged_in:
            self.logger.error("Not logged in")
            return 0
        
        visited_count = 0
        
        for username in usernames:
            try:
                if platform.lower() == "facebook":
                    profile_url = f"https://www.facebook.com/{username}"
                    self.driver.get(profile_url)
                    self.wait_random(3, 5)
                    
                    # Scroll through profile
                    self.scroll_feed(3)
                    
                    # Stay on profile for specified time
                    time.sleep(view_time)
                    
                    visited_count += 1
                    self.logger.info(f"Visited profile: {username}")
                    
            except Exception as e:
                self.logger.error(f"Error visiting profile {username}: {e}")
                continue
        
        return visited_count
    
    def mass_message(self, recipients_file, message_text, platform="facebook"):
        """Send mass messages from recipients file."""
        try:
            with open(recipients_file, 'r') as f:
                recipients = [line.strip() for line in f.readlines() if line.strip()]
            
            sent_count = 0
            
            for recipient in recipients:
                if self.send_message(recipient, message_text, platform):
                    sent_count += 1
                    self.logger.info(f"Message sent to {recipient}")
                    
                # Wait between messages to avoid spam detection
                self.wait_random(30, 60)
            
            self.logger.info(f"Mass messaging completed. Sent {sent_count} messages.")
            return sent_count
            
        except Exception as e:
            self.logger.error(f"Error in mass messaging: {e}")
            return 0
    
    def simulate_human_activity(self, duration_minutes=30, platform="facebook"):
        """Simulate realistic human activity."""
        if not self.logged_in:
            self.logger.error("Not logged in")
            return False
        
        try:
            end_time = time.time() + (duration_minutes * 60)
            activities_performed = 0
            
            while time.time() < end_time:
                # Choose random activity
                activities = [
                    lambda: self.scroll_feed(random.randint(2, 5)),
                    lambda: self.like_posts(random.randint(1, 3), platform),
                    lambda: self.comment_on_posts([], random.randint(0, 2), platform),
                    lambda: self.wait_random(30, 60)  # Just browse/read
                ]
                
                activity = random.choice(activities)
                activity()
                activities_performed += 1
                
                # Random break
                if activities_performed % 5 == 0:
                    self.wait_random(60, 120)
            
            self.logger.info(f"Human activity simulation completed. {activities_performed} activities performed.")
            return True
            
        except Exception as e:
            self.logger.error(f"Error in human activity simulation: {e}")
            return False
    
    def cleanup(self):
        """Clean up resources."""
        if self.driver:
            self.driver.quit()
            self.driver = None
        self.logged_in = False


class ContentGenerator:
    """Generate content for posts and comments."""
    
    @staticmethod
    def generate_post_content():
        """Generate random post content."""
        posts = [
            "Having a great day! Hope everyone is doing well! 😊",
            "Just finished reading an amazing book. Highly recommend it! 📚",
            "Beautiful sunset today. Nature never fails to amaze me! 🌅",
            "Grateful for all the wonderful people in my life! ❤️",
            "Working on some exciting new projects. Can't wait to share! 🚀",
            "Coffee and good vibes to start the day right! ☕",
            "Weekend plans: relaxation and good food! What about you? 🍕",
            "Feeling inspired and motivated today! Let's make it count! 💪"
        ]
        return random.choice(posts)
    
    @staticmethod
    def generate_comments():
        """Generate random comments."""
        comments = [
            "Great post! 👍",
            "Thanks for sharing! 🙏",
            "Love this! ❤️",
            "So inspiring! ✨",
            "Couldn't agree more!",
            "Amazing! 🔥",
            "This made my day! 😊",
            "Absolutely true!",
            "Well said! 👏",
            "Perfect timing for this post!"
        ]
        return comments
