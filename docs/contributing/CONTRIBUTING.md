# Contributing to Profil3r

We welcome contributions to the Profil3r project! This guide will help you understand how to
contribute effectively to our modular architecture.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Modular Architecture](#modular-architecture)
- [Adding New Modules](#adding-new-modules)
- [Event System](#event-system)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- Docker & Docker Compose (recommended)
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/Profil3r.git
   cd Profil3r
   ```

2. **Install Dependencies**

   ```bash
   # Python dependencies
   pip install -r dependencies/requirements.txt

   # Node.js dependencies
   npm install

   # Development dependencies
   pip install -r requirements-dev.txt
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run Tests**

   ```bash
   # Python tests
   python -m pytest

   # Node.js tests
   npm test

   # Integration tests
   npm run test:integration
   ```

## Modular Architecture

The project follows a modular architecture with these key principles:

### Core Modules

- **Facebook Automation** (`modules/facebook_automation.py`)
- **OSINT Utilities** (`modules/osint_utils.py`)
- **Network Utilities** (`modules/network_utils.py`)
- **Event Management** (`tools/modules/EventBus.js`)

### Module Structure

```
modules/
├── your_module/
│   ├── __init__.py
│   ├── main.py          # Main module functionality
│   ├── config.py        # Module configuration
│   ├── events.py        # Event definitions
│   ├── utils.py         # Utility functions
│   └── tests/
│       ├── __init__.py
│       └── test_main.py
```

## Adding New Modules

### Step 1: Create Module Structure

```bash
# Create your module directory
mkdir -p modules/your_module/tests

# Create initial files
touch modules/your_module/__init__.py
touch modules/your_module/main.py
touch modules/your_module/config.py
touch modules/your_module/events.py
touch modules/your_module/utils.py
touch modules/your_module/tests/__init__.py
touch modules/your_module/tests/test_main.py
```

### Step 2: Module Template

Use this template for your main module file:

```python
# modules/your_module/main.py
"""
Your Module - Description of what this module does

This module is part of the Profil3r modular architecture and provides
functionality for [describe functionality].
"""

import logging
from typing import Dict, List, Optional, Any
from ..event_manager import EventManager

class YourModule:
    """
    Your module class following the modular architecture patterns.

    This class integrates with the event system and provides a clean
    interface for your module's functionality.
    """

    def __init__(self, config: Dict[str, Any], event_manager: EventManager):
        """
        Initialize your module.

        Args:
            config: Module configuration dictionary
            event_manager: Event manager instance for communication
        """
        self.config = config
        self.event_manager = event_manager
        self.logger = logging.getLogger(__name__)

        # Subscribe to relevant events
        self.event_manager.subscribe('your_event_type', self._handle_event)

    def _handle_event(self, event_data: Dict[str, Any]) -> None:
        """Handle incoming events."""
        self.logger.info(f"Received event: {event_data}")
        # Your event handling logic here

    def your_main_function(self, param: str) -> Dict[str, Any]:
        """
        Main functionality of your module.

        Args:
            param: Description of parameter

        Returns:
            Dictionary containing results

        Raises:
            YourModuleError: When something goes wrong
        """
        try:
            # Your implementation here
            result = {"status": "success", "data": param}

            # Emit events for other modules
            self.event_manager.emit('your_module_complete', {
                'module': 'your_module',
                'result': result,
                'timestamp': datetime.now().isoformat()
            })

            return result

        except Exception as e:
            self.logger.error(f"Error in your_main_function: {e}")
            self.event_manager.emit('error_occurred', {
                'module': 'your_module',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
            raise YourModuleError(f"Failed to process: {e}")

class YourModuleError(Exception):
    """Custom exception for your module."""
    pass
```

### Step 3: Event Definitions

Define your module's events in `events.py`:

```python
# modules/your_module/events.py
"""
Event definitions for Your Module

This file defines all events that your module can emit or subscribe to.
"""

from typing import Dict, Any
from dataclasses import dataclass

@dataclass
class YourModuleEvent:
    """Base event class for your module."""
    module: str = 'your_module'
    timestamp: str = ''
    data: Dict[str, Any] = None

# Event type constants
YOUR_MODULE_EVENTS = {
    'PROCESS_STARTED': 'your_module_process_started',
    'PROCESS_COMPLETE': 'your_module_process_complete',
    'DATA_VALIDATED': 'your_module_data_validated',
    'ERROR_OCCURRED': 'your_module_error_occurred'
}
```

### Step 4: Configuration

Add configuration support in `config.py`:

```python
# modules/your_module/config.py
"""
Configuration for Your Module
"""

import os
from typing import Dict, Any

class YourModuleConfig:
    """Configuration management for your module."""

    def __init__(self):
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from environment variables and files."""
        return {
            'api_key': os.getenv('YOUR_MODULE_API_KEY', ''),
            'timeout': int(os.getenv('YOUR_MODULE_TIMEOUT', '30')),
            'debug': os.getenv('YOUR_MODULE_DEBUG', 'false').lower() == 'true',
            'max_retries': int(os.getenv('YOUR_MODULE_MAX_RETRIES', '3'))
        }

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        return self.config.get(key, default)

    def validate(self) -> bool:
        """Validate configuration."""
        required_keys = ['api_key']
        return all(self.config.get(key) for key in required_keys)
```

### Step 5: Integration

Add your module to the main CLI in `modules/main.py`:

```python
# Add import
from .your_module import YourModule

# Add to CLI options
parser.add_argument('--your-module', action='store_true',
                   help='Run your module functionality')

# Add to main function
if args.your_module:
    your_module = YourModule(config, event_manager)
    result = your_module.your_main_function(args.param)
    print(f"Your module result: {result}")
```

## Event System

### Available Events

The system supports these event types:

#### Authentication Events

- `auth_success` - Successful authentication
- `auth_failure` - Authentication failed
- `session_expired` - Session has expired

#### OSINT Events

- `osint_search_complete` - OSINT search completed
- `profile_found` - Profile discovered
- `data_validated` - Data validation completed

#### Network Events

- `network_scan_complete` - Network scan finished
- `ip_resolved` - IP address resolved
- `domain_analyzed` - Domain analysis completed

#### Error Events

- `error_occurred` - General error occurred
- `rate_limit_exceeded` - Rate limit reached
- `api_error` - API error occurred

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

## Testing

### Unit Tests

Write comprehensive unit tests for your module:

```python
# modules/your_module/tests/test_main.py
import pytest
from unittest.mock import Mock, patch
from ..main import YourModule, YourModuleError

class TestYourModule:
    """Test cases for YourModule."""

    def setup_method(self):
        """Set up test fixtures."""
        self.config = {'api_key': 'test_key', 'timeout': 30}
        self.event_manager = Mock()
        self.module = YourModule(self.config, self.event_manager)

    def test_initialization(self):
        """Test module initialization."""
        assert self.module.config == self.config
        assert self.module.event_manager == self.event_manager

    def test_your_main_function_success(self):
        """Test successful execution."""
        result = self.module.your_main_function('test_param')
        assert result['status'] == 'success'
        assert result['data'] == 'test_param'

    def test_your_main_function_error(self):
        """Test error handling."""
        with patch.object(self.module, 'some_method', side_effect=Exception('Test error')):
            with pytest.raises(YourModuleError):
                self.module.your_main_function('test_param')
```

### Integration Tests

Create integration tests that test module interaction:

```python
# tests/integration/test_your_module_integration.py
import pytest
from modules.your_module.main import YourModule
from modules.event_manager import EventManager

class TestYourModuleIntegration:
    """Integration tests for YourModule."""

    def test_event_communication(self):
        """Test event communication between modules."""
        event_manager = EventManager()
        config = {'api_key': 'test_key'}

        module = YourModule(config, event_manager)

        # Test event emission and subscription
        received_events = []
        event_manager.subscribe('your_module_complete',
                               lambda data: received_events.append(data))

        result = module.your_main_function('test')

        assert len(received_events) == 1
        assert received_events[0]['module'] == 'your_module'
```

## Code Style

### Python

- Follow PEP 8 style guidelines
- Use type hints for all function parameters and return values
- Include comprehensive docstrings
- Maximum line length: 88 characters (Black formatter)

### JavaScript

- Use ESLint configuration provided in the project
- Follow JSDoc commenting standards
- Use modern ES6+ features
- Prefer `const` and `let` over `var`

### General

- Use meaningful variable and function names
- Keep functions small and focused
- Include error handling for all external calls
- Log important events and errors

## Pull Request Process

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-module-name
   ```

2. **Make Changes**
   - Implement your module following the guidelines
   - Add comprehensive tests
   - Update documentation

3. **Run Tests**

   ```bash
   # Run all tests
   npm run test:all

   # Run linting
   npm run lint

   # Run formatting
   npm run format
   ```

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add your module functionality"
   ```

5. **Push and Create PR**

   ```bash
   git push origin feature/your-module-name
   ```

6. **PR Requirements**
   - Clear description of changes
   - Tests pass
   - Documentation updated
   - Code review approved

## Security

### Security Considerations

- Never commit API keys or sensitive information
- Use environment variables for configuration
- Validate all user inputs
- Implement proper error handling
- Follow OWASP security guidelines

### Reporting Security Issues

Please report security vulnerabilities privately to the maintainers.

## Getting Help

- Check existing issues on GitHub
- Review the documentation in `/docs`
- Ask questions in discussions
- Join our community channels

## Code Review Guidelines

### For Contributors

- Keep PRs focused on a single feature or fix
- Write clear commit messages
- Include tests for new functionality
- Update documentation as needed

### For Reviewers

- Check for adherence to modular architecture
- Verify proper event system usage
- Ensure adequate test coverage
- Review security implications

## License

By contributing to Profil3r, you agree that your contributions will be licensed under the same
license as the project.
