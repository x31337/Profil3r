# Facebook BruteForce - Independent Module

⚠️ **EDUCATIONAL PURPOSE ONLY** ⚠️

This module is for educational and authorized penetration testing only. Unauthorized access to
accounts is illegal.

## Installation

1. Install Python 3.6+
2. Install dependencies:

```bash
pip install requests beautifulsoup4
```

## Usage

```bash
python fb.py
```

## Files

- `fb.py` - Main brute force script
- `fb2.py` - Alternative implementation
- `passwords.txt` - Password dictionary
- `Screenshots/` - Documentation screenshots

## Features

- Facebook login brute force
- Password dictionary support
- Session handling
- Rate limiting protection

## Configuration

The script uses:

- Minimum password length: 6 characters
- Built-in rate limiting
- Session cookies for persistence

## Legal Notice

This tool must only be used:

- On accounts you own
- With explicit written permission
- For authorized security testing
- In compliance with local laws

## Dependencies

- Python 3.6+
- requests library
- beautifulsoup4
- Internet connection

## Standalone Usage

This module operates independently and doesn't require the main Pr0f1l3r installation.

## Security

- The tool includes basic detection avoidance
- Uses proper HTTP headers
- Implements session management
- Includes error handling
