#!/usr/bin/env python3
"""
Pr0f1l3r v2.0 Launcher
Modern Social Media Automation and Profiling Tool

This is the main entry point for the modernized Pr0f1l3r suite.
"""

import sys
from pathlib import Path

# Add modules to path
sys.path.insert(0, str(Path(__file__).parent / "modules"))


def check_requirements():
    """Check if required packages are installed."""
    required_packages = ["selenium", "requests", "beautifulsoup4"]

    missing_packages = []

    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)

    if missing_packages:
        print(f"Missing required packages: {', '.join(missing_packages)}")
        print("Please install them using:")
        print(f"pip install {' '.join(missing_packages)}")
        return False

    return True


def main():
    """Main launcher function."""
    print("Pr0f1l3r v2.0 - Modern Social Media Automation Tool")
    print("=" * 55)

    # Check requirements
    if not check_requirements():
        sys.exit(1)

    # Launch main application
    try:
        from modules.main import main as run_main

        run_main()
    except ImportError as e:
        print(f"Error importing modules: {e}")
        print("Please ensure all modules are properly installed.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nExiting...")
        sys.exit(0)


if __name__ == "__main__":
    main()
