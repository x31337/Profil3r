#!/bin/bash
# Profil3r Configuration Validation Script for CI/CD
# This script validates all configuration files in the project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Starting Profil3r Configuration Validation${NC}"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if jsonschema is available
if ! python3 -c "import jsonschema" &> /dev/null; then
    echo -e "${YELLOW}📦 Installing jsonschema...${NC}"
    pip install jsonschema>=4.0.0
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"

# Find all config files
CONFIG_FILES=(
    "config.json"
    "config.dev.json"
    "config.ci.json"
    "config.prod.json"
)

echo -e "${YELLOW}📋 Found configuration files:${NC}"
VALID_FILES=()
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
        VALID_FILES+=("$file")
    else
        echo -e "  - $file ${YELLOW}(not found, skipping)${NC}"
    fi
done

if [ ${#VALID_FILES[@]} -eq 0 ]; then
    echo -e "${RED}❌ No configuration files found to validate${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Validating configurations...${NC}"

# Validate each configuration file
VALIDATION_FAILED=false
for config_file in "${VALID_FILES[@]}"; do
    echo -e "${YELLOW}Validating $config_file...${NC}"

    if python3 scripts/validate_config.py "$config_file" --quiet; then
        echo -e "${GREEN}✅ $config_file is valid${NC}"
    else
        echo -e "${RED}❌ $config_file validation failed${NC}"
        VALIDATION_FAILED=true
    fi
done

echo ""
if [ "$VALIDATION_FAILED" = true ]; then
    echo -e "${RED}❌ Configuration validation failed!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All configurations are valid!${NC}"
    exit 0
fi
