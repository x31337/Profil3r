# Installation Guide

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- Docker and Docker Compose (for containerized deployment)
- Ruby 2.7 or higher (for Ruby tools)

## Installation Methods

### Option 1: Docker (Recommended)

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/Profil3r.git
   cd Profil3r
   ```

2. Build and start services:

   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. Verify installation:
   ```bash
   docker-compose ps
   ```

### Option 2: Local Installation

1. **Install Python dependencies:**

   ```bash
   pip install -r dependencies/requirements.txt
   ```

2. **Install JavaScript dependencies:**

   ```bash
   cd tools/js_tools/facebook_mass_messenger && npm install
   cd ../messenger_bot_framework/fbbot && npm install
   ```

3. **Install Ruby dependencies:**

   ```bash
   sudo apt install libssl-dev zlib1g-dev
   sudo gem install nokogiri mechanize colorize highline optparse
   ```

4. **Configure settings:**
   ```bash
   cp config/config.dev.json config/config.json
   # Edit config/config.json with your API keys
   ```

## Configuration

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

## Verification

Test the installation:

```bash
# Python modules
python -m modules.main

# Docker services
docker-compose exec profil3r-core python -c "import profil3r.core; print('OK')"

# Health checks
curl http://localhost:8000/api/health
curl http://localhost:3000/api/health
curl http://localhost:4444/api/health
```
