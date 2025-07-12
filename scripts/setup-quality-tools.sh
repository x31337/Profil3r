#!/bin/bash

set -e

echo "🔧 Setting up code quality tools..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install pre-commit
echo "Installing pre-commit..."
if command_exists pre-commit; then
    print_status "pre-commit already installed"
else
    pip install pre-commit
    print_status "pre-commit installed"
fi

# Install Python tools
echo "Installing Python tools..."
pip install black isort flake8
print_status "Python tools installed"

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
if [ -f "package.json" ]; then
    npm install
    print_status "Node.js dependencies installed"
else
    print_warning "package.json not found, skipping npm install"
fi

# Install PHP CS Fixer
echo "Installing PHP CS Fixer..."
if command_exists php && command_exists composer; then
    if ! command_exists php-cs-fixer; then
        composer global require friendsofphp/php-cs-fixer
        print_status "PHP CS Fixer installed"
    else
        print_status "PHP CS Fixer already installed"
    fi
else
    print_warning "PHP or Composer not found, skipping PHP CS Fixer installation"
fi

# Install RuboCop
echo "Installing RuboCop..."
if command_exists ruby && command_exists gem; then
    if ! command_exists rubocop; then
        gem install rubocop
        print_status "RuboCop installed"
    else
        print_status "RuboCop already installed"
    fi
else
    print_warning "Ruby or Gem not found, skipping RuboCop installation"
fi

# Install pre-commit hooks
echo "Installing pre-commit hooks..."
pre-commit install
print_status "Pre-commit hooks installed"

# Install husky hooks
echo "Installing husky hooks..."
if [ -f "package.json" ]; then
    npm run prepare
    print_status "Husky hooks installed"
else
    print_warning "package.json not found, skipping husky setup"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Summary:"
echo "• Pre-commit hooks are installed and will run on every commit"
echo "• Husky + lint-staged will handle JavaScript files"
echo "• All tools are configured to auto-fix issues when possible"
echo ""
echo "🚀 Next steps:"
echo "1. Make some changes to your code"
echo "2. Run 'git commit' to see the hooks in action"
echo "3. Or run 'pre-commit run --all-files' to check all files now"
echo ""
echo "📖 For more information, see CODE_QUALITY.md"
