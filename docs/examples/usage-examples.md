# Usage Examples

## Basic OSINT Operations

### Username Search Across Platforms

```python
from modules.osint_utils import OsintUtilities

osint = OsintUtilities()

# Search for username across multiple platforms
results = osint.username_reconnaissance("john_doe")
print(f"Found profiles: {results}")

# Search specific platforms
github_info = osint.github_user_info("john_doe")
print(f"GitHub info: {github_info}")
```

### Email Validation and Discovery

```python
from modules.osint_utils import OsintUtilities

osint = OsintUtilities()

# Validate email address
email_validation = osint.email_validation("john.doe@example.com")
print(f"Email valid: {email_validation}")

# Find emails by name
emails = osint.find_emails_by_name("John Doe")
print(f"Found emails: {emails}")
```

## Facebook Automation

### Basic Facebook Operations

```python
from modules.facebook_automation import FacebookAutomation

fb = FacebookAutomation()

# Login to Facebook
fb.login("your_email@example.com", "your_password")

# Post to timeline
fb.post_to_timeline("Hello from automation!")

# Send message
fb.send_message("friend_id", "Hello friend!")

# Like posts
fb.like_posts_by_keyword("automation")
```

### Advanced Facebook Operations

```python
from modules.facebook_automation import FacebookAutomation

fb = FacebookAutomation()

# Login and save session
fb.login("your_email@example.com", "your_password")
fb.save_session("facebook_session.json")

# Visit profiles and simulate activity
profiles = ["user1", "user2", "user3"]
for profile in profiles:
    fb.visit_profile(profile)
    fb.simulate_human_activity()

# Mass friend requests
fb.send_friend_requests(["user1", "user2", "user3"])
```

## Network Utilities

### IP and Domain Analysis

```python
from modules.network_utils import NetworkUtilities

net = NetworkUtilities()

# Get IP geolocation
location = net.ip_geolocation("8.8.8.8")
print(f"IP Location: {location}")

# Domain information
domain_info = net.domain_info("example.com")
print(f"Domain info: {domain_info}")

# Phone number validation
phone_info = net.phone_validation("+1234567890")
print(f"Phone info: {phone_info}")
```

### Google Dorking

```python
from modules.network_utils import NetworkUtilities

net = NetworkUtilities()

# Perform Google dorking
results = net.google_dorking("site:github.com filetype:json")
print(f"Dorking results: {results}")

# Bypass Bitly URLs
original_url = net.bitly_bypass("https://bit.ly/shortened-url")
print(f"Original URL: {original_url}")
```

## CLI Usage

### Interactive Mode

```bash
# Start interactive CLI
python -m modules.main

# Follow the prompts to:
# 1. Choose Facebook Automation
# 2. Choose OSINT Utilities
# 3. Choose Network Utilities
```

### Direct Command Execution

```bash
# Run specific OSINT operation
python -m modules.main --osint --username "john_doe"

# Run Facebook automation
python -m modules.main --facebook --login "email@example.com" --password "pass"

# Run network analysis
python -m modules.main --network --ip "8.8.8.8"
```

## Docker Usage Examples

### Running Services

```bash
# Start all services
docker-compose up -d

# Use OSINT API
curl "http://localhost:8000/api/osint/username/john_doe"

# Use JavaScript tools
curl "http://localhost:3000/api/health"

# Use Facebook mass messenger
curl "http://localhost:4444/api/health"
```

### Batch Operations

```bash
# Process multiple usernames
for username in "user1" "user2" "user3"; do
    curl "http://localhost:8000/api/osint/username/$username"
done

# Batch email validation
for email in "test1@example.com" "test2@example.com"; do
    curl "http://localhost:8000/api/osint/email/$email"
done
```

## Configuration Examples

### Basic Configuration

```json
{
  "log_level": "INFO",
  "log_directory": "logs",
  "cookie_file_path": ".fb_cookies.json",
  "REALEMAIL_API_KEY": "your_key_here",
  "VERIPHONE_API_KEY": "your_key_here",
  "GITHUB_TOKEN": "your_token_here",
  "headless": false,
  "browser": "chrome",
  "wait_general_min": 1.5,
  "wait_general_max": 3.5
}
```

### Advanced Configuration

```json
{
  "log_level": "DEBUG",
  "log_directory": "logs",
  "cli_log_filename": "unified_cli.log",
  "cookie_file_path": ".fb_cookies.json",
  "selenium_session_file": "facebook_selenium_session.json",
  "REALEMAIL_API_KEY": "your_realemail_key",
  "VERIPHONE_API_KEY": "your_veriphone_key",
  "GITHUB_TOKEN": "your_github_token",
  "default_fb_email": "your_fb_email@example.com",
  "headless": true,
  "browser": "chrome",
  "profil3r_config_path": "profil3r/config.json",
  "wait_general_min": 2.0,
  "wait_general_max": 5.0,
  "max_retries": 3,
  "timeout": 30
}
```

## Automation Workflows

### Complete OSINT Investigation

```python
from modules.osint_utils import OsintUtilities
from modules.network_utils import NetworkUtilities

def investigate_target(username, email=None, phone=None):
    osint = OsintUtilities()
    net = NetworkUtilities()

    results = {}

    # Username reconnaissance
    results['username'] = osint.username_reconnaissance(username)

    # Email validation if provided
    if email:
        results['email'] = osint.email_validation(email)

    # Phone validation if provided
    if phone:
        results['phone'] = net.phone_validation(phone)

    # GitHub information
    results['github'] = osint.github_user_info(username)

    return results

# Use the workflow
investigation = investigate_target("john_doe", "john@example.com", "+1234567890")
print(investigation)
```

### Mass Facebook Operations

```python
from modules.facebook_automation import FacebookAutomation
import time

def mass_friend_and_message(targets, message_template):
    fb = FacebookAutomation()

    # Login once
    fb.login("your_email@example.com", "your_password")

    for target in targets:
        try:
            # Send friend request
            fb.send_friend_request(target)
            time.sleep(30)  # Wait between requests

            # Send message
            message = message_template.format(name=target)
            fb.send_message(target, message)
            time.sleep(60)  # Wait between messages

        except Exception as e:
            print(f"Error with {target}: {e}")
            continue

# Use the workflow
targets = ["user1", "user2", "user3"]
template = "Hello {name}, nice to meet you!"
mass_friend_and_message(targets, template)
```
