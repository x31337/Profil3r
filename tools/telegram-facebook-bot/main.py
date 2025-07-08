#!/usr/bin/env python3
"""
Main entry point for the telegram-facebook-bot application.
This script imports and runs the FB_Bot.py main function.
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the main bot
from FB_Bot import main

if __name__ == "__main__":
    main()
