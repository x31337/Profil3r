# Profil3r Modules

This directory contains all the modular components of the Profil3r system, designed with a clean architecture that promotes scalability and maintainability.

## Architecture Overview

The modular architecture is built around:

- **Separation of Concerns**: Each module handles specific functionality
- **Event-Driven Communication**: Modules communicate through events
- **Dependency Injection**: Configuration and dependencies are injected
- **Testability**: Each module can be tested independently

## Core Modules

### Facebook Automation (`facebook_automation.py`)

Handles all Facebook-related automation tasks:

- **Features:**
  - Selenium-based UI automation
  - Facebook Graph API integration
  - Session management with cookie persistence
  - Human-like activity simulation
  - Brute-force login capabilities

- **Events Emitted:**
  - `auth_success` - Successful authentication
  - `auth_failure` - Authentication failed
  - `session_expired` - Session has expired
  - `profile_found` - Profile discovered

- **Usage:**
  ```python
  from modules.facebook_automation import FacebookAutomation
  fb = FacebookAutomation()
  fb.login("email@example.com", "password")
  fb.post_to_timeline("Hello from automation!")
  ```

### OSINT Utilities (`osint_utils.py`)

Provides Open Source Intelligence gathering capabilities:

- **Features:**
  - Username reconnaissance across platforms
  - Email validation with API verification
  - GitHub user information lookup
  - Social media profile discovery
  - Temporary email generation

- **Events Emitted:**
  - `osint_search_complete` - Search completed
  - `profile_found` - Profile discovered
  - `data_validated` - Data validation completed

- **Usage:**
  ```python
  from modules.osint_utils import OsintUtilities
  osint = OsintUtilities()
  results = osint.username_reconnaissance("john_doe")
  ```

### Network Utilities (`network_utils.py`)

Handles network analysis and reconnaissance:

- **Features:**
  - IP geolocation and analysis
  - Domain information via HackerTarget
  - Phone number validation via VeriPhone
  - Google Dorking capabilities
  - URL bypass tools

- **Events Emitted:**
  - `network_scan_complete` - Network scan finished
  - `ip_resolved` - IP address resolved
  - `domain_analyzed` - Domain analysis completed

- **Usage:**
  ```python
  from modules.network_utils import NetworkUtilities
  net = NetworkUtilities()
  location = net.ip_geolocation("8.8.8.8")
  ```

## Module Structure

Each module follows a consistent structure:

```
modules/
├── module_name/
│   ├── __init__.py          # Module initialization
│   ├── main.py              # Main module functionality
│   ├── config.py            # Configuration management
│   ├── events.py            # Event definitions
│   ├── utils.py             # Utility functions
│   └── tests/
│       ├── __init__.py
│       └── test_main.py     # Unit tests
```

## Event System

The event system enables loose coupling between modules:

### Event Types

- **Authentication Events**: `auth_success`, `auth_failure`, `session_expired`
- **OSINT Events**: `osint_search_complete`, `profile_found`, `data_validated`
- **Network Events**: `network_scan_complete`, `ip_resolved`, `domain_analyzed`
- **Error Events**: `error_occurred`, `rate_limit_exceeded`, `api_error`

### Event Usage

```python
# Subscribe to events
event_manager.subscribe('profile_found', self.handle_profile_found)

# Emit events
event_manager.emit('profile_found', {
    'platform': 'facebook',
    'profile_url': 'https://facebook.com/user123',
    'confidence': 0.95,
    'timestamp': datetime.now().isoformat()
})
```

## Configuration

Modules use a centralized configuration system:

```python
# config.json
{
  "log_level": "INFO",
  "facebook_automation": {
    "headless": false,
    "browser": "chrome",
    "timeout": 30
  },
  "osint_utils": {
    "max_concurrent_searches": 5,
    "api_timeout": 15
  },
  "network_utils": {
    "default_timeout": 10,
    "max_retries": 3
  }
}
```

## Adding New Modules

To add a new module:

1. Create the module directory structure
2. Implement the module following the architecture patterns
3. Add comprehensive tests
4. Update the main CLI to include your module
5. Update documentation

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## Testing

Each module includes comprehensive tests:

```bash
# Run all module tests
python -m pytest modules/

# Run specific module tests
python -m pytest modules/facebook_automation/tests/

# Run with coverage
python -m pytest --cov=modules/
```

## Integration

Modules integrate seamlessly with the main CLI:

```python
# Interactive mode
python -m modules.main

# Direct module execution
python -m modules.main --facebook --username "target_user"
python -m modules.main --osint --email "target@example.com"
python -m modules.main --network --ip "8.8.8.8"
```

## Best Practices

- **Error Handling**: Always handle exceptions gracefully
- **Logging**: Use structured logging for debugging
- **Events**: Emit events for important state changes
- **Configuration**: Make modules configurable
- **Testing**: Write unit and integration tests
- **Documentation**: Document all public APIs

## Performance Considerations

- **Async Operations**: Use async/await for I/O operations
- **Caching**: Implement caching for expensive operations
- **Rate Limiting**: Respect API rate limits
- **Resource Management**: Clean up resources properly

## Security

- **API Keys**: Never hardcode API keys
- **Input Validation**: Validate all user inputs
- **Error Messages**: Don't expose sensitive information
- **Logging**: Be careful with sensitive data in logs
