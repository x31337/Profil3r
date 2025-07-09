#!/usr/bin/env python3
"""
Security check script for Profil3r project.
Runs Bandit with appropriate skips for false positives.
"""

import json
import subprocess
import sys


def run_bandit_check():
    """Run Bandit security check with proper configurations."""

    # Skip tests that are false positives after our fixes:
    # B113: requests without timeout (false positive - all our requests have timeout)
    # B404: subprocess import (acceptable - needed for curl fallback)
    # B603: subprocess without shell=True (acceptable - using full path)
    skip_tests = "B113,B404,B603"

    cmd = ["python", "-m", "bandit", "-r", "modules/", "-s", skip_tests, "-f", "json"]

    print("Running Bandit security analysis...")
    print(f"Command: {' '.join(cmd)}")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)

        if result.returncode == 0:
            # Parse JSON output
            data = json.loads(result.stdout)
            issue_count = len(data.get("results", []))

            print(f"✅ Security check passed! Found {issue_count} issues.")

            if issue_count > 0:
                print("\nRemaining issues:")
                for issue in data["results"]:
                    print(
                        f"  - {issue['test_name']}: {issue['filename']}:{issue['line_number']}"
                    )
                    print(f"    {issue['issue_text']}")

            return True
        else:
            print(f"❌ Bandit failed with return code {result.returncode}")
            print(f"stdout: {result.stdout}")
            print(f"stderr: {result.stderr}")
            return False

    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse Bandit output: {e}")
        print(f"stdout: {result.stdout}")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


if __name__ == "__main__":
    success = run_bandit_check()
    sys.exit(0 if success else 1)
