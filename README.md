# Comprehensive Facebook & OSINT Automation Toolkit

This repository is a consolidated collection of tools for Facebook automation, OSINT gathering, and
other network utilities. It merges functionalities from various scripts and projects into a more
organized and modernized structure.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Configuration](#configuration)
- [Core Modules](#core-modules)
- [Tools](#tools)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)

## Overview

The new architecture of this project is modular, allowing for easy extension and maintenance. The
primary goals of this refactoring include:

- **Modular Architecture:** Design the project in modules to enhance scalability and
  maintainability.
- **Consolidate Duplicate Logic:** Merge similar functionalities into unified modules.
- **Modernize Code:** Update older code using current best practices and libraries.
- **Functional Organization:** Group tools and scripts by purpose, such as Facebook automation,
  OSINT, and networking.

## Quick Start

### Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/your-repo/Profil3r.git
cd Profil3r

# Start services
docker-compose up -d

# Verify services are running
curl http://localhost:8000/api/health
curl http://localhost:3000/api/health
curl http://localhost:4444/api/health
```

### Local Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Start interactive CLI
python -m modules.main
```

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Installation Guide](docs/setup/installation.md)** - Detailed setup instructions
- **[Docker Deployment](docs/docker/deployment.md)** - Docker configuration and management
- **[API Reference](docs/api/reference.md)** - REST API endpoints and usage
- **[Usage Examples](docs/examples/usage-examples.md)** - Code examples and tutorials
- **[Troubleshooting](docs/troubleshooting/common-issues.md)** - Common issues and solutions

## Installation

For detailed installation instructions, see
[docs/setup/installation.md](docs/setup/installation.md).

### Prerequisites

- Python 3.8+
- Node.js 14+
- Docker & Docker Compose (recommended)
- Ruby 2.7+ (for Ruby tools)

## Docker Setup

For comprehensive Docker documentation, see [docs/docker/deployment.md](docs/docker/deployment.md).

### Quick Start

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Health Check Verification

```bash
# Install wait-on for service verification
npm install -g wait-on

# Verify all services are healthy
wait-on http://localhost:8000/api/health http://localhost:3000/api/health http://localhost:4444/api/health
```

### Service Endpoints

| Service            | Port | Health Check  | Description                         |
| ------------------ | ---- | ------------- | ----------------------------------- |
| OSINT Framework    | 8000 | `/api/health` | OSINT operations and reconnaissance |
| JS Tools           | 3000 | `/api/health` | JavaScript tools and bot framework  |
| Facebook Messenger | 4444 | `/api/health` | Mass messaging and automation       |
| PHP Tools          | 8080 | `/health`     | PHP scripts and utilities           |

## Configuration

For complete configuration details, see [docs/setup/installation.md](docs/setup/installation.md).

### Environment Variables

Create a `.env` file in the project root:

```env
# Database configuration
POSTGRES_DB=profil3r
POSTGRES_USER=profil3r
POSTGRES_PASSWORD=your_secure_password

# API Keys
REALEMAIL_API_KEY=your_realemail_api_key
VERIPHONE_API_KEY=your_veriphone_api_key
GITHUB_TOKEN=your_github_token

# Application settings
LOG_LEVEL=INFO
HEADLESS=false
BROWSER=chrome
```

### Configuration File

Update `config.json` with your settings:

```json
{
  "log_level": "INFO",
  "log_directory": "logs",
  "REALEMAIL_API_KEY": "your_key_here",
  "VERIPHONE_API_KEY": "your_key_here",
  "GITHUB_TOKEN": "your_token_here",
  "headless": false,
  "browser": "chrome"
}
```

## Core Modules

The project is structured into various core modules, designed to isolate functionality and promote a
clean architecture:

### Facebook Automation

- **UI Automation:** Leverages Selenium for Facebook interactions such as login, posting, and
  messaging.
- **API Integration:** Utilizes the Facebook Graph API for data retrieval.
- **Session Management:** Handles cookies for maintaining sessions.
- **Human-like Activity Simulation:** Simulates user interactions to avoid detection.

### OSINT Utilities

- **Username Reconnaissance:** Searches for usernames across different platforms.
- **Email Validation:** Checks email validity using external APIs.
- **Social Media Analysis:** Investigates social media profiles and generates reports.

### Network Utilities

- **IP and Domain Analysis:** Provides IP geolocation and domain information.
- **Phone Number Check:** Verifies phone numbers using the VeriPhone API.
- **Advanced Search Tools:** Features Google Dorking and URL bypass technologies.

### Unified CLI

- **Command-line Interface:** Offers a unified CLI for executing tasks easily.
- **Workflow Integration:** Combines several tools to streamline operations.

## Tools

### Profil3r OSINT (`profil3r/`)

- Original OSINT tool for social network profile discovery
- Integrated with the unified CLI
- Standalone execution: `python profil3r.py`

### JavaScript Tools (`tools/js_tools/`)

- **Facebook Mass Messenger** - Web interface for bulk messaging
- **Messenger Bot Framework** - Node.js library for Facebook bots
- **Browser Enhancements** - User scripts for enhanced functionality

### PHP Scripts (`tools/php_tools/`)

- Collection of Facebook interaction scripts
- Account management and token handling
- Page creation and management tools

### Ruby Reporter (`ruby_tool_faceports_reporter_run.rb`)

- Facebook login and reporting automation
- Uses Mechanize for web automation
- Complementary to Python modules

## API Reference

For detailed API documentation, see [docs/api/reference.md](docs/api/reference.md).

### Health Check Endpoints

- **OSINT Service**: `http://localhost:8000/api/health`
- **JS Tools Service**: `http://localhost:3000/api/health`
- **Facebook Messenger**: `http://localhost:4444/api/health`

### REST API Examples

```bash
# Username search
curl "http://localhost:8000/api/osint/username/john_doe"

# Email validation
curl "http://localhost:8000/api/osint/email/john@example.com"

# Domain analysis
curl "http://localhost:8000/api/network/domain/example.com"
```

## Examples

For comprehensive examples and tutorials, see
[docs/examples/usage-examples.md](docs/examples/usage-examples.md).

### Basic Usage

```python
# OSINT operations
from modules.osint_utils import OsintUtilities
osint = OsintUtilities()

# Username reconnaissance
results = osint.username_reconnaissance("john_doe")

# Email validation
email_status = osint.email_validation("john@example.com")

# Facebook automation
from modules.facebook_automation import FacebookAutomation
fb = FacebookAutomation()
fb.login("email@example.com", "password")
fb.post_to_timeline("Hello from automation!")

# Network analysis
from modules.network_utils import NetworkUtilities
net = NetworkUtilities()
location = net.ip_geolocation("8.8.8.8")
domain_info = net.domain_info("example.com")
```

### CLI Usage

```bash
# Interactive mode
python -m modules.main

# Direct execution
python -m modules.main --osint --username "john_doe"

# OSINT with email validation
python -m modules.main --osint --email "john@example.com"

# Network analysis
python -m modules.main --network --ip "8.8.8.8"
```

### Event System

The system now provides an event-driven architecture. Events are triggered at various stages:

- **Authentication Events:** `auth_success`, `auth_failure`, `session_expired`
- **OSINT Events:** `osint_search_complete`, `profile_found`, `data_validated`
- **Network Events:** `network_scan_complete`, `ip_resolved`, `domain_analyzed`
- **Error Events:** `error_occurred`, `rate_limit_exceeded`, `api_error`

```python
# Event listener example
from modules.event_manager import EventManager

def on_profile_found(event_data):
    print(f"Profile found: {event_data['profile_url']}")

event_manager = EventManager()
event_manager.subscribe('profile_found', on_profile_found)
```

## Troubleshooting

For common issues and solutions, see
[docs/troubleshooting/common-issues.md](docs/troubleshooting/common-issues.md).

### Quick Fixes

```bash
# Fix permissions
sudo chown -R $USER:$USER ./logs ./results ./config

# Clean Docker resources
docker system prune -af

# Check service logs
docker-compose logs -f
```

## Contributing

Contributions are highly appreciated! The project follows a modular structure, making it easier to
add and maintain new features. Please:

1. **Fork the Repository:** Create your copy of the repository.
2. **Feature Branch:** Create a branch for your new module or feature.
3. **Implement Your Module:** Ensure it adheres to the project's modular architecture.
4. **Testing:** Develop tests to ensure functionality and integration.
5. **Pull Request:** Submit your changes for review.

### Development Setup

- **Dependency Installation:**
  ```bash
  pip install -r requirements.txt
  ```
- **Running Tests:**
  ```bash
  python -m pytest
  ```
- **Code Formatting:**
  ```bash
  black modules/
  ```

### Adding New Modules

To add a new module, follow these guidelines:

- **Directory Structure:** Place your module in the appropriate directory within `modules/`.
- **Documentation:** Provide clear documentation within your module.
- **Modular Design:** Incorporate functionality cohesively, ensuring easy interaction with existing
  modules.
- **Tests:** Integrate tests for your module in the `tests/` directory.

## Disclaimer

These tools are provided for educational and analytical purposes. Interacting with platforms like
Facebook programmatically may violate their Terms of Service. Users are responsible for ensuring
their use of these tools is compliant with all applicable laws and platform policies. The developers
assume no liability for misuse.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions:

- **Documentation**: Check the `/docs` directory for comprehensive guides
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions for help and ideas
- **Email**: Contact the maintainers for security issues

---

**Note**: This toolkit consolidates multiple OSINT and automation tools into a unified, modern
platform. All tools are designed for ethical use and educational purposes only.
