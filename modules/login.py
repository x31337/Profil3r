"""
Login Module
Manage login functionalities for various platforms.
"""

import requests
import getpass

class LoginManager:

    def basic_login(self, url, username, password):
        """Basic HTTP login functionality."""
        response = requests.get(url, auth=(username, password))
        return response.ok

    def interactive_login(self, url):
        """Interactive login that prompts the user for credentials."""
        username = input('Enter your username: ')
        password = getpass.getpass('Enter your password: ')
        return self.basic_login(url, username, password)

