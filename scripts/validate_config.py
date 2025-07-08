#!/usr/bin/env python3
"""
Profil3r Configuration Validator

This script validates configuration files against the JSON schema.
Usage: python validate_config.py <config_file>

Exit codes:
0 - Configuration is valid
1 - Configuration is invalid
2 - File not found or other error
"""

import json
import jsonschema
import sys
import os
import argparse
from pathlib import Path
from jsonschema import validate, ValidationError


def load_json_file(filepath):
    """Load and parse JSON file with error handling."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found", file=sys.stderr)
        sys.exit(2)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{filepath}': {e}", file=sys.stderr)
        sys.exit(2)
    except Exception as e:
        print(f"Error reading '{filepath}': {e}", file=sys.stderr)
        sys.exit(2)


def validate_config(config_path, schema_path="schema/config.schema.json"):
    """Validate configuration file against schema."""
    
    # Find schema file relative to script location
    script_dir = Path(__file__).parent.parent
    schema_file = script_dir / schema_path
    
    if not schema_file.exists():
        print(f"Error: Schema file not found at {schema_file}", file=sys.stderr)
        sys.exit(2)
    
    # Load schema and config
    schema = load_json_file(schema_file)
    config = load_json_file(config_path)
    
    # Validate configuration
    try:
        validate(instance=config, schema=schema)
        print(f"✅ Configuration '{config_path}' is valid")
        return True
    except ValidationError as err:
        print(f"❌ Configuration '{config_path}' is invalid!", file=sys.stderr)
        print(f"Error: {err.message}", file=sys.stderr)
        if err.path:
            print(f"Path: {' -> '.join(str(p) for p in err.path)}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error during validation: {e}", file=sys.stderr)
        sys.exit(2)


def main():
    parser = argparse.ArgumentParser(
        description="Validate Profil3r configuration files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python validate_config.py config.json
  python validate_config.py config.dev.json
  python validate_config.py config.*.json  # Validate all environment configs
        """
    )
    
    parser.add_argument(
        "config_files", 
        nargs="+",
        help="Configuration file(s) to validate"
    )
    
    parser.add_argument(
        "--schema", 
        default="schema/config.schema.json",
        help="Path to schema file (default: schema/config.schema.json)"
    )
    
    parser.add_argument(
        "--quiet", 
        action="store_true",
        help="Only output errors"
    )
    
    args = parser.parse_args()
    
    valid_count = 0
    total_count = 0
    
    for config_file in args.config_files:
        total_count += 1
        if not args.quiet:
            print(f"Validating {config_file}...")
        
        if validate_config(config_file, args.schema):
            valid_count += 1
        else:
            if not args.quiet:
                print()
    
    if not args.quiet:
        print(f"\nValidation complete: {valid_count}/{total_count} files valid")
    
    if valid_count != total_count:
        sys.exit(1)
    
    sys.exit(0)


if __name__ == "__main__":
    main()
