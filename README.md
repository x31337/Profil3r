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

The primary goal of this refactoring is to:

- **Consolidate Duplicate Logic:** Merge similar functionalities from scattered scripts into unified
  Python modules.
- **Modernize Code:** Update older code to use current best practices, libraries, and error
  handling.
- **Organize by Functionality:** Group tools and scripts based on their purpose (e.g., Facebook
  automation, OSINT, network utilities, JavaScript tools).

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

The toolkit is organized into several core modules:

### Facebook Automation (`modules/facebook_automation.py`)

- **Selenium-based UI automation** for login, posting, messaging, friending
- **Facebook Graph API integration** for user info and friends lists
- **Session management** with cookie saving/loading
- **Activity simulation** for human-like behavior
- **Brute-force login capabilities** (Selenium and requests-based)

### OSINT Utilities (`modules/osint_utils.py`)

- **Username reconnaissance** across multiple platforms
- **Email validation** with API-based verification
- **GitHub user information** lookup
- **Temporary email** generation and checking
- **Social media profile discovery**

### Network Utilities (`modules/network_utils.py`)

- **IP geolocation** and analysis
- **Domain information** via HackerTarget (DNS, WHOIS)
- **Phone number validation** via VeriPhone
- **Google Dorking** capabilities
- **URL bypass** tools (Bitly, etc.)

### Unified CLI (`modules/main.py`)

- **Interactive command-line interface** for all modules
- **Configuration management** from `config.json`
- **Integrated workflows** combining multiple tools

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
results = osint.username_reconnaissance("john_doe")

# Facebook automation
from modules.facebook_automation import FacebookAutomation
fb = FacebookAutomation()
fb.login("email@example.com", "password")
fb.post_to_timeline("Hello from automation!")

# Network analysis
from modules.network_utils import NetworkUtilities
net = NetworkUtilities()
location = net.ip_geolocation("8.8.8.8")
```

### CLI Usage

```bash
# Interactive mode
python -m modules.main

# Direct execution
python -m modules.main --osint --username "john_doe"
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

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup

```bash
# Install development dependencies
pip install -r requirements.txt

# Run tests
python -m pytest

# Format code
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
