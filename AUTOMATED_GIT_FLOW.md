# Automated Git Flow & PR Bot Configuration

This document explains the automated Git flow and PR bot setup that has been implemented for this
project.

## Overview

The automated Git flow system implements:

1. **Mergify** for automated PR management
2. **Conventional Commits** enforcement
3. **Semantic Release** for automated versioning and changelog generation
4. **GitHub Actions** for CI/CD automation

## Components

### 1. Mergify Configuration (`.mergify.yml`)

Mergify automates PR management with the following features:

#### Auto-merge Dependabot PRs

- **Trigger**: When Dependabot creates a PR
- **Conditions**:
  - CI Pipeline passes
  - Code Quality checks pass
  - At least 1 approval
  - No requested changes
- **Action**: Automatically merge with squash method

#### Auto-merge Conventional Commits

- **Trigger**: PRs with conventional commit format
- **Conditions**:
  - CI Pipeline passes
  - Code Quality checks pass
  - At least 2 approvals
  - No requested changes
  - Title follows conventional commit format
- **Action**: Automatically merge with squash method

#### Auto-rebase

- **Trigger**: When base branch is updated
- **Conditions**: At least 1 approval
- **Action**: Automatically rebase PR

#### Auto-labeling

- Automatically adds labels based on PR content:
  - `dependencies` and `bot` for Dependabot PRs
  - `enhancement` for feature PRs
  - `bug` for bug fix PRs
  - `documentation` for docs PRs

### 2. Conventional Commits Enforcement

#### Commitlint Configuration (`commitlint.config.js`)

- Enforces conventional commit format
- Supported types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`,
  `build`, `revert`, `deps`
- Maximum header length: 100 characters
- Case sensitivity enforcement

#### Husky Hook (`.husky/commit-msg`)

- Validates commit messages before commit
- Runs commitlint on every commit
- Prevents non-conventional commits

### 3. Semantic Release (`.releaserc.json`)

Automates versioning and changelog generation:

#### Version Bumping

- **Major**: Breaking changes (manual `BREAKING CHANGE:` in commit)
- **Minor**: New features (`feat:` commits)
- **Patch**: Bug fixes and improvements (`fix:`, `perf:`, `refactor:`, etc.)

#### Changelog Generation

- Automatically generates `CHANGELOG.md`
- Groups changes by type with emojis:
  - ✨ Features
  - 🐛 Bug Fixes
  - ⚡ Performance Improvements
  - ♻️ Code Refactoring
  - 📚 Documentation
  - 📦 Dependencies

#### GitHub Integration

- Creates GitHub releases
- Attaches distribution packages
- Comments on PRs when released
- Adds release labels

### 4. GitHub Actions

#### Release Workflow (`.github/workflows/release.yml`)

- **Trigger**: Push to `main` or `develop` branches
- **Actions**:
  - Runs tests and quality checks
  - Executes semantic-release
  - Creates tags and releases
  - Generates changelog

#### Conventional Commits Validation

- **Trigger**: Pull requests
- **Actions**:
  - Validates PR title format
  - Validates all commit messages
  - Comments on PR if validation fails

#### Dependabot Auto-PR

- **Trigger**: Dependabot pushes
- **Actions**:
  - Enables auto-merge for Dependabot PRs
  - Works with Mergify configuration

## Usage

### For Developers

1. **Commit Messages**: Use conventional commit format

   ```bash
   git commit -m "feat(auth): add OAuth2 authentication"
   git commit -m "fix(api): resolve memory leak in user service"
   git commit -m "docs(readme): update installation instructions"
   ```

2. **Pull Requests**: Title must follow conventional commit format

   ```
   feat(auth): add OAuth2 authentication
   fix(api): resolve memory leak in user service
   docs(readme): update installation instructions
   ```

3. **Approvals**:
   - Regular PRs need 2 approvals for auto-merge
   - Dependabot PRs need 1 approval for auto-merge

### For Maintainers

1. **Mergify Setup**: Install Mergify GitHub App on the repository
2. **Secrets**: Ensure `GITHUB_TOKEN` has necessary permissions
3. **Branch Protection**: Configure branch protection rules for `main`
4. **Team Setup**: Create `profil3r-maintainers` team for reviews

## Benefits

1. **Reduced Manual Work**: Automatic merging, rebasing, and versioning
2. **Consistency**: Enforced conventional commits and standardized workflow
3. **Quality**: Automated checks before merging
4. **Transparency**: Automated changelog generation
5. **Security**: Automatic dependency updates via Dependabot
6. **Efficiency**: Faster iteration with automated processes

## Monitoring

- **Mergify Dashboard**: Monitor PR automation status
- **GitHub Actions**: Check workflow runs and failures
- **Dependabot**: Track dependency updates and security alerts
- **Releases**: Monitor semantic versioning and changelog generation

## Troubleshooting

### Common Issues

1. **Mergify not merging**:
   - Check CI status
   - Verify approvals
   - Confirm conventional commit format
   - Check branch protection rules

2. **Semantic release failing**:
   - Verify `GITHUB_TOKEN` permissions
   - Check conventional commit format
   - Ensure no duplicate releases

3. **Commitlint failures**:
   - Verify commit message format
   - Check allowed types in `commitlint.config.js`
   - Ensure proper scope formatting

### Debug Commands

```bash
# Test commit message locally
echo "feat(auth): add OAuth2" | npx commitlint

# Check semantic release dry run
npx semantic-release --dry-run

# Validate Mergify configuration
# Visit: https://mergify.io/configuration-check
```

## Configuration Files

- `.mergify.yml` - Mergify automation rules
- `commitlint.config.js` - Commit message validation
- `.releaserc.json` - Semantic release configuration
- `.github/workflows/release.yml` - GitHub Actions workflow
- `.husky/commit-msg` - Git commit hook
- `package.json` - Dependencies and scripts

This automated setup ensures consistent, high-quality development workflow with minimal manual
intervention while maintaining security and code quality standards.
