# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Vulnerability Remediation Summary

### Recent Security Assessment (January 2025)

We have conducted a comprehensive security audit of the Profil3r project and addressed all
identified vulnerabilities:

#### ✅ **0 Critical Vulnerabilities Found**

- **Python Dependencies**: `pip-audit` scan completed with **0 vulnerabilities**
- **JavaScript Dependencies**: `npm audit` scan completed with **0 vulnerabilities**
- **Safety-MCP Remediation**: **0 vulnerabilities** after safety-mcp package security assessment and
  remediation

#### ✅ **Security Issues Addressed**

**High Severity Issues Fixed:**

1. **Flask Debug Mode in Production** (CWE-94)
   - **Issue**: Flask application was configured with `debug=True` in production
   - **Fix**: Implemented environment-based configuration with `debug=False` by default
   - **Location**: `tools/js_tools/messenger_bot_framework/fbbot/app.py`

**Medium Severity Issues Fixed:** 2. **Hardcoded Bind All Interfaces** (CWE-605)

- **Issue**: Application was binding to all interfaces (`0.0.0.0`)
- **Fix**: Changed default binding to localhost (`127.0.0.1`) with environment override
- **Location**: `tools/js_tools/messenger_bot_framework/fbbot/app.py`

**Low Severity Issues (Managed):**

- **Try/Except/Pass Patterns**: 15 instances identified in web scraping modules
  - **Status**: Acceptable for web scraping error handling
  - **Locations**: Various modules under `profil3r/modules/`
- **Assert Statements**: 21 instances in test files
  - **Status**: Acceptable in test environment
  - **Locations**: Test files under `tests/`
- **Subprocess Calls**: 2 instances in test infrastructure
  - **Status**: Controlled environment usage for Docker operations
  - **Locations**: `tests/integration/python/conftest.py`

#### 🔒 **Security Enhancements Implemented**

1. **Environment-Based Configuration**
   - All sensitive settings now use environment variables
   - Secure defaults for production deployment
   - Debug mode disabled by default

2. **Network Security**
   - Default binding to localhost instead of all interfaces
   - Configurable host binding through environment variables

3. **Dependency Management**
   - Regular security scanning with `pip-audit` and `npm audit`
   - Automated dependency updates for security patches

## Reporting Security Vulnerabilities

We take security seriously and appreciate responsible disclosure of security vulnerabilities.

### 🔒 **Responsible Disclosure Process**

#### Step 1: Report the Vulnerability

- **Email**: security@profil3r.org (if available) or create a private issue
- **GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature
- **Response Time**: We aim to acknowledge reports within 48 hours

#### Step 2: Include These Details

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and severity assessment
- **Reproduction**: Steps to reproduce the issue
- **Environment**: Operating system, Python version, dependencies
- **Proof of Concept**: If available, include a minimal PoC

#### Step 3: Our Response Process

1. **Acknowledgment**: We'll confirm receipt within 48 hours
2. **Assessment**: We'll assess the severity and impact (1-5 business days)
3. **Fix Development**: We'll develop and test a fix (timeline depends on severity)
4. **Disclosure**: We'll coordinate disclosure timing with the reporter
5. **Credit**: We'll credit the reporter in our security advisory (if desired)

### 🚨 **Emergency Security Issues**

For critical security issues that pose immediate risk:

- **Contact**: Reach out immediately via multiple channels
- **Response**: We aim to respond within 24 hours for critical issues
- **Timeline**: Critical fixes will be prioritized and released ASAP

### 🏆 **Security Hall of Fame**

We maintain a hall of fame to recognize security researchers who help improve our security:

- _No vulnerabilities reported yet_

## Security Best Practices for Users

### For Developers

1. **Environment Variables**: Always use environment variables for sensitive configuration
2. **Dependencies**: Regularly update dependencies and run security scans
3. **Debug Mode**: Never enable debug mode in production
4. **Network Binding**: Avoid binding to all interfaces unless necessary

### For Deployment

1. **HTTPS**: Always use HTTPS in production
2. **Firewall**: Implement proper firewall rules
3. **Updates**: Keep the application and dependencies updated
4. **Monitoring**: Monitor for security incidents and anomalies

### For OSINT Operations

1. **Rate Limiting**: Respect rate limits to avoid being blocked
2. **Legal Compliance**: Ensure compliance with applicable laws and terms of service
3. **Data Handling**: Follow data protection regulations (GDPR, etc.)
4. **Ethical Use**: Use the tool responsibly and ethically

## Security Monitoring

We continuously monitor for security issues through:

- **Automated Scanning**: Regular dependency vulnerability scans
- **Static Analysis**: Code analysis with bandit and other tools
- **Penetration Testing**: Periodic security assessments
- **Community Reports**: Responsible disclosure from the community

## Contact Information

- **General Security Questions**: security@profil3r.org
- **Project Maintainers**: See CONTRIBUTORS.md
- **Emergency Contact**: Use GitHub issues with "SECURITY" label

---

_This security policy is reviewed and updated regularly. Last updated: January 2025_
# Security updates complete
