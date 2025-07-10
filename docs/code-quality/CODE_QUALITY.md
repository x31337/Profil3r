# Code Quality & Auto-fix Hooks

This project uses automated code quality tools to ensure consistent formatting and catch potential
issues before they reach the repository.

## Tools Overview

### Pre-commit Hooks

- **Python**: `black`, `isort`, `flake8`
- **JavaScript/TypeScript**: `eslint --fix`, `prettier`
- **PHP**: `php-cs-fixer fix`
- **Ruby**: `rubocop -A`

### Configuration Files

- `.pre-commit-config.yaml`: Pre-commit hook configuration
- `package.json`: JavaScript dependencies and lint-staged configuration
- `eslint.config.js`: ESLint configuration
- `.prettierrc`: Prettier configuration
- `.rubocop.yml`: RuboCop configuration
- `.php-cs-fixer.php`: PHP-CS-Fixer configuration
- `pyproject.toml`: Python tools configuration

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- PHP 8.1+
- Ruby 3.0+

### Setup

1. Install pre-commit hooks:

   ```bash
   pre-commit install
   ```

2. Install Node.js dependencies:

   ```bash
   npm install
   ```

3. Install Python dependencies:

   ```bash
   pip install black isort flake8
   ```

4. Install PHP-CS-Fixer:

   ```bash
   composer global require friendsofphp/php-cs-fixer
   ```

5. Install RuboCop:
   ```bash
   gem install rubocop
   ```

## Usage

### Automatic Formatting on Commit

The pre-commit hooks will automatically run when you commit:

- Auto-fix issues where possible
- Block commits if unfixable issues are found
- Re-stage files after auto-fixing

### Manual Commands

#### Python

```bash
# Format code
black .
isort .

# Check only (no changes)
black --check .
isort --check-only .

# Lint
flake8 .
```

#### JavaScript/TypeScript

```bash
# Format code
npx prettier --write .

# Check only (no changes)
npx prettier --check .

# Lint and fix
npx eslint . --ext .js,.ts,.jsx,.tsx --fix

# Lint only (no changes)
npx eslint . --ext .js,.ts,.jsx,.tsx
```

#### PHP

```bash
# Format code
php-cs-fixer fix

# Check only (no changes)
php-cs-fixer fix --dry-run --diff
```

#### Ruby

```bash
# Format and fix code
rubocop -A

# Check only (no changes)
rubocop
```

#### All Languages

```bash
# Run all pre-commit hooks manually
pre-commit run --all-files

# Run lint-staged (JavaScript focus)
npx lint-staged
```

## Workflow

1. **Developer makes changes** to any supported file type
2. **Commits changes** using `git commit`
3. **Pre-commit hooks run automatically**:
   - Auto-fix formatting issues
   - Re-stage fixed files
   - Block commit if unfixable issues remain
4. **Developer addresses** any blocking issues
5. **Commits successfully** after fixes
6. **CI verifies** formatting in pull requests

## IDE Integration

### VS Code

Install these extensions for better integration:

- Python: `ms-python.python`, `ms-python.black-formatter`
- JavaScript: `esbenp.prettier-vscode`, `dbaeumer.vscode-eslint`
- PHP: `junstyle.php-cs-fixer`
- Ruby: `rebornix.ruby`, `misogi.ruby-rubocop`

### Configuration

Add to your VS Code settings:

```json
{
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/code-quality.yml`) ensures:

- All code passes the same checks locally and in CI
- Pull requests are blocked if formatting issues exist
- Consistent code quality across the project

## Troubleshooting

### Pre-commit hook failures

```bash
# Update hooks to latest versions
pre-commit autoupdate

# Clean and reinstall hooks
pre-commit clean
pre-commit install
```

### Skipping hooks (emergency only)

```bash
# Skip all hooks
git commit --no-verify -m "Emergency commit"

# Skip specific hook
SKIP=flake8 git commit -m "Skip flake8"
```

### Tool-specific issues

```bash
# Python: Clear cache
black --clear-cache

# JavaScript: Clear node_modules
rm -rf node_modules package-lock.json
npm install

# PHP: Clear cache
php-cs-fixer --clear-cache

# Ruby: Update RuboCop
gem update rubocop
```

## Customization

### Adding new file types

Edit `.pre-commit-config.yaml` and add appropriate hooks.

### Changing rules

- **Python**: Modify `pyproject.toml`
- **JavaScript**: Modify `eslint.config.js` and `.prettierrc`
- **PHP**: Modify `.php-cs-fixer.php`
- **Ruby**: Modify `.rubocop.yml`

### Excluding files

Add patterns to the respective ignore files or tool configurations.

## Best Practices

1. **Run hooks before pushing**: `pre-commit run --all-files`
2. **Keep configurations in sync** between local and CI
3. **Update tools regularly**: `pre-commit autoupdate`
4. **Document any custom rules** in team guidelines
5. **Use consistent formatting** across all languages

## Technical Debt: Python Lint Exclusion

The file `modules/facebook_automation.py` is currently excluded from flake8 linting in `.pre-commit-config.yaml` due to:

- Numerous lines exceeding 88 characters (E501)
- f-string formatting issues (F541)

This exclusion is a temporary measure to unblock CI and pre-commit workflows. **This file should be refactored in the future** to restore full linting coverage and maintain code quality standards.
