# Comprehensive Facebook & OSINT Automation Toolkit

This repository is a consolidated collection of tools for Facebook automation, OSINT gathering, and
network utilities. It merges functionalities from various scripts and projects into a modern,
modular architecture designed for scalability and maintainability.

## Overview

The project features a modular architecture that isolates functionality and promotes clean design:

- **Modular Architecture:** Scalable and maintainable module-based design
- **Consolidated Logic:** Unified modules for similar functionalities
- **Modern Code:** Updated using current best practices and libraries
- **Functional Organization:** Tools grouped by purpose (Facebook automation, OSINT, networking)

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

### Prerequisites

- Python 3.8+
- Node.js 14+
- Docker & Docker Compose (recommended)
- Ruby 2.7+ (for Ruby tools)

## Core Modules

### Facebook Automation

- **UI Automation:** Selenium-based Facebook interactions (login, posting, messaging)
- **API Integration:** Facebook Graph API for data retrieval
- **Session Management:** Cookie handling for persistent sessions
- **Human-like Activity:** Simulated user interactions to avoid detection

### OSINT Utilities

- **Username Reconnaissance:** Cross-platform username searches
- **Email Validation:** External API-based email verification
- **Social Media Analysis:** Profile investigation and reporting

### Network Utilities

- **IP/Domain Analysis:** Geolocation and domain information
- **Phone Number Check:** VeriPhone API integration
- **Advanced Search:** Google Dorking and URL bypass tools

### Unified CLI

- **Command-line Interface:** Unified CLI for all operations
- **Workflow Integration:** Streamlined multi-tool operations

## Documentation

<details>
<summary>📚 Setup & Installation</summary>

- [Installation Guide](docs/setup/installation.md) - Complete setup instructions
- [Docker Deployment](docs/docker/deployment.md) - Docker configuration and management

</details>

<details>
<summary>🔧 Configuration & Dependencies</summary>

- [Configuration System](docs/configuration/CONFIG_SYSTEM.md) - System configuration documentation
- [Dependency Management](docs/configuration/DEPENDENCY_MANAGEMENT.md) - Dependency management
  procedures

</details>

<details>
<summary>🛠️ Development & Code Quality</summary>

- [Contributing Guidelines](docs/contributing/CONTRIBUTING.md) - Development contribution guidelines
- [Code Quality Standards](docs/code-quality/CODE_QUALITY.md) - Code quality standards and tooling
- [Quick Setup Guide](docs/code-quality/QUICK_SETUP.md) - Quick setup and tooling configuration
- [Automated Git Flow](docs/code-quality/AUTOMATED_GIT_FLOW.md) - Automated Git workflow and tooling

</details>

<details>
<summary>🔒 Security Documentation</summary>

- [Security Policy](docs/security/SECURITY.md) - Security policies and vulnerability reporting
- [Security Fixes](docs/security/SECURITY_FIXES.md) - Security fixes and patches documentation
- [Security Remediation](docs/security/SECURITY_REMEDIATION.md) - Security remediation procedures

</details>

<details>
<summary>🐍 Python Modules</summary>

- [Python Modules Documentation](docs/modules/python-modules.md) - Python module documentation

</details>

<details>
<summary>🟨 JavaScript Tools</summary>

- [JavaScript Tools Documentation](docs/tools/javascript-tools.md) - JavaScript tools documentation

</details>

<details>
<summary>📊 API Reference</summary>

- [API Reference](docs/api/reference.md) - REST API endpoints and usage

</details>

<details>
<summary>💡 Examples & Usage</summary>

- [Usage Examples](docs/examples/usage-examples.md) - Code examples and tutorials

</details>

<details>
<summary>🔧 Troubleshooting</summary>

- [Common Issues](docs/troubleshooting/common-issues.md) - Common issues and solutions

</details>

<details>
<summary>📄 Reports</summary>

- [Baseline Audit Report](docs/reports/BASELINE_AUDIT_REPORT.md) - Baseline audit report
- [System Validation Report](docs/reports/SYSTEM_VALIDATION_REPORT.md) - System validation report

</details>

<details>
<summary>📁 Miscellaneous</summary>

- [Documentation Category Mapping](docs/miscellaneous/DOCUMENTATION_CATEGORY_MAPPING.md) -
  Documentation structure mapping
- [README v2](docs/miscellaneous/README_v2.md) - Alternative README file

</details>

## Service Endpoints

| Service            | Port | Health Check  | Description                         |
| ------------------ | ---- | ------------- | ----------------------------------- |
| OSINT Framework    | 8000 | `/api/health` | OSINT operations and reconnaissance |
| JS Tools           | 3000 | `/api/health` | JavaScript tools and bot framework  |
| Facebook Messenger | 4444 | `/api/health` | Mass messaging and automation       |
| PHP Tools          | 8080 | `/health`     | PHP scripts and utilities           |

## Quick Examples

### Python API Usage

```python
# OSINT operations
from modules.osint_utils import OsintUtilities
osint = OsintUtilities()
results = osint.username_reconnaissance("john_doe")

# Facebook automation
from modules.facebook_automation import FacebookAutomation
fb = FacebookAutomation()
fb.login("email@example.com", "password")
fb.post_to_timeline("Hello from automation!")
```

### CLI Usage

```bash
# Interactive mode
python -m modules.main

# Direct execution
python -m modules.main --osint --username "john_doe"

# Network analysis
python -m modules.main --network --ip "8.8.8.8"
```

### REST API Examples

```bash
# Username search
curl "http://localhost:8000/api/osint/username/john_doe"

# Email validation
curl "http://localhost:8000/api/osint/email/john@example.com"

# Domain analysis
curl "http://localhost:8000/api/network/domain/example.com"
```

## Environment Configuration

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

## Docker Management

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

## Event System

The system provides an event-driven architecture with events triggered at various stages:

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

## Development

```bash
# Dependency installation
pip install -r requirements.txt

# Running tests
python -m pytest

# Code formatting
black modules/
```

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
