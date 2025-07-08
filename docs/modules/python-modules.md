# Python Modules Documentation

## Overview

The core Python modules provide the main functionality for Facebook automation, OSINT operations, and network utilities. All modules are located in the `modules/` directory.

## Facebook Automation Module

### Class: `FacebookAutomation`

Located in `modules/facebook_automation.py`

#### Key Features
- Selenium-based browser automation
- Facebook Graph API integration
- Session management with persistent cookies
- Human-like activity simulation
- Mass operations (posting, messaging, friending)

#### Basic Usage

```python
from modules.facebook_automation import FacebookAutomation

# Initialize
fb = FacebookAutomation()

# Login
fb.login("your_email@example.com", "your_password")

# Post to timeline
fb.post_to_timeline("Hello from automation!")

# Send message
fb.send_message("friend_id", "Hello friend!")

# Save session for later use
fb.save_session("session.json")
```

#### Advanced Features

```python
# Brute force login (use carefully)
fb.brute_force_login("email@example.com", ["pass1", "pass2", "pass3"])

# Simulate human activity
fb.simulate_human_activity()

# Mass friend requests
fb.send_friend_requests(["user1", "user2", "user3"])

# Like posts by keyword
fb.like_posts_by_keyword("automation")
```

## OSINT Utilities Module

### Class: `OsintUtilities`

Located in `modules/osint_utils.py`

#### Key Features
- Username reconnaissance across platforms
- Email validation and discovery
- GitHub user information lookup
- Temporary email generation
- Social media profile discovery

#### Basic Usage

```python
from modules.osint_utils import OsintUtilities

# Initialize
osint = OsintUtilities()

# Username search
results = osint.username_reconnaissance("john_doe")

# Email validation
validation = osint.email_validation("test@example.com")

# GitHub user info
github_info = osint.github_user_info("username")
```

#### Supported Platforms

- GitHub
- Twitter
- Instagram
- LinkedIn
- Facebook
- Reddit
- YouTube
- TikTok
- And many more...

## Network Utilities Module

### Class: `NetworkUtilities`

Located in `modules/network_utils.py`

#### Key Features
- IP geolocation and analysis
- Domain information lookup
- Phone number validation
- Google dorking capabilities
- URL bypass tools

#### Basic Usage

```python
from modules.network_utils import NetworkUtilities

# Initialize
net = NetworkUtilities()

# IP geolocation
location = net.ip_geolocation("8.8.8.8")

# Domain information
domain_info = net.domain_info("example.com")

# Phone validation
phone_info = net.phone_validation("+1234567890")
```

#### Advanced Features

```python
# Google dorking
results = net.google_dorking("site:github.com filetype:json")

# Bypass shortened URLs
original_url = net.bitly_bypass("https://bit.ly/short-url")

# DNS lookup
dns_info = net.dns_lookup("example.com")
```

## Unified CLI Module

### Class: `UnifiedCliApp`

Located in `modules/main.py`

#### Features
- Interactive command-line interface
- Configuration management
- Integrated workflows
- Logging and error handling

#### Usage

```bash
# Interactive mode
python -m modules.main

# Direct execution
python -m modules.main --help
```

#### Configuration

The CLI reads from `config.json`:

```json
{
    "log_level": "INFO",
    "log_directory": "logs",
    "REALEMAIL_API_KEY": "your_key",
    "VERIPHONE_API_KEY": "your_key",
    "GITHUB_TOKEN": "your_token",
    "headless": false,
    "browser": "chrome"
}
```

## Common Patterns

### Error Handling

All modules include comprehensive error handling:

```python
try:
    result = osint.username_reconnaissance("username")
except Exception as e:
    print(f"Error: {e}")
    # Handle error appropriately
```

### Logging

Enable logging in configuration:

```python
import logging
logging.basicConfig(level=logging.INFO)
```

### Session Management

Save and load sessions:

```python
# Save session
fb.save_session("my_session.json")

# Load session
fb.load_session("my_session.json")
```

## Best Practices

1. **Rate Limiting**: Implement delays between requests
2. **Error Handling**: Always use try-catch blocks
3. **Session Management**: Save sessions for efficiency
4. **Configuration**: Use config files for sensitive data
5. **Logging**: Enable appropriate logging levels
6. **Respect ToS**: Follow platform terms of service

## Dependencies

Key Python packages required:

- `selenium` - Web browser automation
- `requests` - HTTP requests
- `beautifulsoup4` - HTML parsing
- `lxml` - XML/HTML processing
- `webdriver-manager` - WebDriver management
- `colorama` - Colored terminal output
- `tqdm` - Progress bars

Install with:
```bash
pip install -r requirements.txt
```
