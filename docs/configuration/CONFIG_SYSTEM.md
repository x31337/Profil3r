# Profil3r Configuration System

This document describes the centralized configuration system for Profil3r, which provides
environment-aware configuration management and validation.

## Overview

The new configuration system provides:

- **Centralized schema validation** using JSON Schema
- **Environment-specific configurations** (dev, ci, prod)
- **Automated validation** for CI/CD pipelines
- **Per-language settings** support
- **Extensible platform definitions**

## Files Structure

```
Profil3r/
├── schema/
│   └── config.schema.json          # JSON Schema for validation
├── scripts/
│   ├── validate_config.py          # Python validation script
│   ├── validate_all_configs.sh     # Shell script for CI/CD
│   └── requirements.txt            # Dependencies for validation
├── config/config.json                     # Default configuration
├── config.dev.json                 # Development environment
├── config.ci.json                  # CI/CD environment
└── config.prod.json                # Production environment
```

## Configuration Schema

The configuration schema (`schema/config.schema.json`) defines the structure for all configuration
files and includes:

### Core Configuration

- `separators`: Character separators for username permutations
- `report_elements`: List of platforms to include in reports
- `*_report_path`: Path templates for different report formats

### Platform Configuration (`plateform`)

Each platform entry supports:

- `rate_limit`: Requests per minute limit
- `format`: URL format with `{permutation}` placeholder
- `type`: Platform category (social, email, domain, etc.)
- `enabled`: Whether the platform is active ("yes"/"no")
- `domains`: Email domains (for email platforms)
- `TLD`: Top-level domains (for domain platforms)

### Profil3r Settings

- `timeout`: Request timeout in seconds
- `max_workers`: Maximum concurrent threads
- `user_agent`: HTTP user agent string
- `retry_count`: Number of retry attempts

### Language Settings

Support for Python, JavaScript, and PHP:

- `packages`: Required packages/dependencies
- `*_version`: Language version requirements
- `virtual_env`: Virtual environment path

### Logging Configuration

- `level`: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `file`: Log file path
- `max_size`: Maximum log file size in bytes
- `backup_count`: Number of backup files to keep

## Environment Configurations

### Development (`config.dev.json`)

- Lower rate limits for faster testing
- Debug logging enabled
- Minimal platform set
- Local report paths

### CI/CD (`config.ci.json`)

- Moderate rate limits
- Info-level logging
- Test-specific settings
- CI-friendly paths

### Production (`config.prod.json`)

- Higher rate limits for performance
- Warning-level logging only
- Full platform set
- Production paths and settings

## Validation

### Python Validator (`scripts/validate_config.py`)

Basic usage:

```bash
python3 scripts/validate_config.py config/config.json
```

Advanced usage:

```bash
# Validate multiple files
python3 scripts/validate_config.py config.*.json

# Use custom schema
python3 scripts/validate_config.py --schema custom.schema.json config/config.json

# Quiet mode (only errors)
python3 scripts/validate_config.py --quiet config/config.json
```

### CI/CD Integration (`scripts/validate_all_configs.sh`)

For automated validation in pipelines:

```bash
./scripts/validate_all_configs.sh
```

This script:

- Checks for Python 3 availability
- Installs jsonschema if needed
- Validates all configuration files
- Provides colored output
- Returns appropriate exit codes

## Usage Examples

### Loading Configuration in Python

```python
import json
from pathlib import Path

def load_config(env='prod'):
    config_file = f"config/config.{env}.json"
    if not Path(config_file).exists():
        config_file = "config/config.json"  # Fallback to default

    with open(config_file, 'r') as f:
        return json.load(f)

# Usage
config = load_config('dev')
timeout = config.get('profil3r', {}).get('timeout', 10)
```

### Adding New Platforms

1. Add platform definition to all environment configs:

```json
{
  "plateform": {
    "newplatform": {
      "rate_limit": 100,
      "format": "https://newplatform.com/{permutation}",
      "type": "social",
      "enabled": "yes"
    }
  }
}
```

2. Update schema if needed (new types, properties)
3. Validate configuration: `python3 scripts/validate_config.py config/config.json`

### Pipeline Integration

#### GitHub Actions

```yaml
- name: Validate Configuration
  run: |
    pip install jsonschema>=4.0.0
    ./scripts/validate_all_configs.sh
```

#### GitLab CI

```yaml
validate_config:
  script:
    - pip install jsonschema>=4.0.0
    - ./scripts/validate_all_configs.sh
```

#### Jenkins

```groovy
stage('Validate Config') {
    steps {
        sh 'pip install jsonschema>=4.0.0'
        sh './scripts/validate_all_configs.sh'
    }
}
```

## Migration Guide

### From Old Configuration

1. **Backup existing config**: `cp config/config.json config/config.json.backup`
2. **Run validation**: `python3 scripts/validate_config.py config/config.json`
3. **Add new sections** if validation fails:
   ```json
   {
     "profil3r": {
       "timeout": 10,
       "max_workers": 10,
       "user_agent": "Mozilla/5.0...",
       "retry_count": 3
     },
     "logging": {
       "level": "INFO"
     }
   }
   ```

### Updating Existing Code

Replace hardcoded config access:

```python
# Old way
timeout = 10  # hardcoded

# New way
timeout = config.get('profil3r', {}).get('timeout', 10)
```

## Best Practices

1. **Always validate** configuration files before deployment
2. **Use environment-specific configs** for different deployment stages
3. **Keep sensitive data** out of configuration files (use environment variables)
4. **Document custom additions** to the schema
5. **Test configuration changes** in development environment first
6. **Use version control** for configuration files
7. **Set up validation** in CI/CD pipelines

## Troubleshooting

### Common Validation Errors

1. **Missing required fields**: Add required properties to config
2. **Invalid enum values**: Check allowed values in schema
3. **Type mismatches**: Ensure correct data types (string, integer, etc.)
4. **Invalid JSON**: Use a JSON validator to check syntax

### Debugging

Enable debug logging to see detailed configuration loading:

```json
{
  "logging": {
    "level": "DEBUG"
  }
}
```

### Performance Tuning

Adjust these settings based on your needs:

- `rate_limit`: Higher for better performance, lower for rate limit compliance
- `max_workers`: More workers = faster execution (but more resource usage)
- `timeout`: Longer for slow networks, shorter for faster failure detection
- `retry_count`: More retries = better reliability (but slower on failures)

## Contributing

When adding new features:

1. Update the schema (`schema/config.schema.json`)
2. Add to all environment configs
3. Update this documentation
4. Run validation tests
5. Test with different environments

## Support

For issues with the configuration system:

1. Check this documentation
2. Validate your configuration files
3. Review the JSON schema
4. Check the validation script output
5. Submit issues with validation errors and config files
