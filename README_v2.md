# Pr0f1l3r v2.0 - Modern Social Media Automation Suite

<p align=center>
  <span>Comprehensive social media automation and profiling tool with independent modules</span>
  <br>
  <a target="_blank" href="https://www.python.org/downloads/" title="Python version"><img src="https://img.shields.io/badge/Made%20with-Python-1f425f.svg"></a>
  <a target="_blank" href="LICENSE" title="License: MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a>
  &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-project-structure">Structure</a>
  &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-features">Features</a>
  &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-installation">Installation</a>
  &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#%EF%B8%8F-legal-notice">Legal</a>
</p>

## 🚀 Quick Start

```bash
# Run the modernized suite
python launcher.py

# Or use specific modules independently
cd modules/
python main.py
```

## 📁 Project Structure

This project has been restructured into **independent modules** that can work standalone:

### 🔧 Core Modules (`modules/`)
- **`create.py`** - Account creation and profile generation
- **`login.py`** - Authentication management  
- **`interact.py`** - Social media interactions (posts, likes, comments)
- **`report.py`** - Reporting and moderation tools
- **`facebook_automation.py`** - Comprehensive Facebook automation
- **`main.py`** - Unified interface for all modules

### 🔨 Independent Tools
Each subdirectory is now completely **independent** and can be used separately:

| Module | Description | Status |
|--------|-------------|--------|
| `E4GL30S1NT/` | OSINT intelligence gathering | ✅ Independent |
| `Facebook-BruteForce/` | Educational brute force testing | ✅ Independent |
| `FB-auto-report/` | Automated reporting system | ✅ Independent |
| `FReport/` | Advanced reporting framework | ✅ Independent |
| `facebook-mass-message/` | Mass messaging system | ✅ Independent |
| `telegram-facebook-bot/` | Telegram-Facebook bridge | ✅ Independent |
| `OSINT-Framework/` | Open source intelligence framework | ✅ Independent |
| `profil3r/` | Original profiling tool | ✅ Independent |

## ✨ Features

### 🆕 New in v2.0
- **Modular Architecture**: Each tool works independently
- **Modern GUI Interface**: Interactive command-line interface
- **Enhanced Automation**: Advanced Facebook automation capabilities
- **Session Management**: Save and restore login sessions
- **Mass Operations**: Bulk account creation, reporting, messaging
- **Security Features**: Built-in detection avoidance
- **Comprehensive Logging**: Detailed operation logs

### 🎯 Core Capabilities

#### 👤 Account Management
- ✅ Create multiple Facebook accounts
- ✅ Generate realistic profile data
- ✅ Manage account credentials
- ✅ Session persistence

#### 🤖 Automation Features
- ✅ Automated posting and interactions
- ✅ Like and comment on posts
- ✅ Send private messages
- ✅ Human-like activity simulation
- ✅ Mass operations support

#### 📊 Reporting & Moderation
- ✅ Report accounts/posts
- ✅ Mass reporting from lists
- ✅ Custom report reasons
- ✅ Activity logging

#### 🔍 Intelligence Gathering
- ✅ Profile discovery across platforms
- ✅ Email enumeration
- ✅ Social media profiling
- ✅ OSINT data collection

## 🛠️ Installation

### Prerequisites
- Python 3.7+ 
- Chrome/Chromium browser
- Internet connection

### Modern Suite (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/Pr0f1l3r.git
cd Pr0f1l3r

# Install dependencies for modern suite
cd modules/
pip install -r requirements.txt

# Run the unified interface
python main.py

# Or use the launcher
cd ..
python launcher.py
```

### Individual Modules
Each module can be used independently:

```bash
# Example: Facebook BruteForce
cd Facebook-BruteForce/
pip install requests beautifulsoup4
python fb.py

# Example: OSINT Framework
cd OSINT-Framework/
npm install
npm start

# Example: E4GL30S1NT
cd E4GL30S1NT/
pip install -r requirements.txt
python E4GL30S1NT.py
```

## 📖 Usage Examples

### Modern Suite
```bash
# Start the main interface
python launcher.py

# Follow the interactive menus:
# [1] Account Creation
# [2] Login & Authentication  
# [3] Social Media Interactions
# [4] Reporting & Moderation
# [5] Facebook Automation Suite
# [6] Profile Discovery
```

### Direct Module Usage
```python
# Account Creation
from modules.create import AccountCreator
creator = AccountCreator()
account = creator.create_facebook_account()

# Facebook Automation
from modules.facebook_automation import FacebookAutomation
with FacebookAutomation() as fb:
    fb.login_facebook("email", "password")
    fb.report_account("target_url", 5)

# Social Interactions
from modules.interact import SocialInteractor
interactor = SocialInteractor()
interactor.like_posts(10)
```

## ⚙️ Configuration

### Global Configuration
The main `config.json` file controls:
- Report paths and formats
- Platform settings
- Rate limiting
- Default services

### Module-Specific Configuration
Each module has its own configuration options:
- `modules/requirements.txt` - Dependencies
- Individual module settings
- Logging configuration

## 📊 Reporting

The suite generates comprehensive reports in multiple formats:

- **JSON**: Structured data in `reports/json/`
- **HTML**: Visual reports in `reports/html/` 
- **CSV**: Spreadsheet format in `reports/csv/`
- **Logs**: Detailed operation logs

## ⚠️ Legal Notice

**IMPORTANT**: This tool is for educational and authorized testing purposes only.

### Allowed Uses
✅ Testing your own accounts  
✅ Authorized security research  
✅ Educational purposes  
✅ Compliance testing with permission  

### Prohibited Uses
❌ Unauthorized access to accounts  
❌ Harassment or abuse  
❌ Violating platform Terms of Service  
❌ Any illegal activities  

Users are responsible for:
- Complying with all applicable laws
- Respecting platform Terms of Service
- Obtaining proper authorization
- Using tools ethically and responsibly

## 🔒 Security Features

- Rate limiting to avoid detection
- User-Agent rotation
- Session management
- Proxy support (where applicable)
- Error handling and recovery
- Secure credential handling

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Follow ethical disclosure for security issues
- Respect the educational nature of this project

## 🚫 Disclaimer

The authors and contributors of this project:
- Are not responsible for misuse of these tools
- Do not encourage illegal or unethical activities  
- Provide these tools for educational purposes only
- Recommend following all applicable laws and regulations

---

**Remember**: With great power comes great responsibility. Use these tools ethically and legally.
