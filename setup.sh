#!/bin/bash

# setup.sh - Language-Independent Build Setup Script
# Detects OS, installs system dependencies, and sets up language environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} ${message}"
            echo "[${timestamp}] [INFO] ${message}" >> ./build_logs/setup.log
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} ${message}"
            echo "[${timestamp}] [WARN] ${message}" >> ./build_logs/setup.log
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${message}"
            echo "[${timestamp}] [ERROR] ${message}" >> ./build_logs/setup.log
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} ${message}"
            echo "[${timestamp}] [DEBUG] ${message}" >> ./build_logs/setup.log
            ;;
    esac
}

# Create build logs directory if it doesn't exist
mkdir -p ./build_logs

# Initialize log file
echo "=== Setup Script Started at $(date) ===" > ./build_logs/setup.log

log "INFO" "Starting setup script..."

# Detect OS
detect_os() {
    log "INFO" "Detecting operating system..."

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            OS="ubuntu"
            PACKAGE_MANAGER="apt"
        elif command -v yum &> /dev/null; then
            OS="centos"
            PACKAGE_MANAGER="yum"
        elif command -v dnf &> /dev/null; then
            OS="fedora"
            PACKAGE_MANAGER="dnf"
        else
            OS="linux"
            PACKAGE_MANAGER="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PACKAGE_MANAGER="brew"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
        PACKAGE_MANAGER="choco"
    else
        OS="unknown"
        PACKAGE_MANAGER="unknown"
    fi

    log "INFO" "Detected OS: $OS with package manager: $PACKAGE_MANAGER"
}

# Install system dependencies based on OS
install_system_deps() {
    log "INFO" "Installing system dependencies..."

    case $OS in
        "ubuntu")
            log "INFO" "Installing dependencies for Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y \
                curl \
                wget \
                git \
                build-essential \
                software-properties-common \
                apt-transport-https \
                ca-certificates \
                gnupg \
                lsb-release
            ;;
        "centos"|"fedora")
            log "INFO" "Installing dependencies for CentOS/Fedora..."
            if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
                sudo yum update -y
                sudo yum groupinstall -y "Development Tools"
                sudo yum install -y curl wget git
            else
                sudo dnf update -y
                sudo dnf groupinstall -y "Development Tools"
                sudo dnf install -y curl wget git
            fi
            ;;
        "macos")
            log "INFO" "Installing dependencies for macOS..."
            # Install Homebrew if not present
            if ! command -v brew &> /dev/null; then
                log "INFO" "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew update
            ;;
        "windows")
            log "INFO" "Installing dependencies for Windows..."
            # Install Chocolatey if not present
            if ! command -v choco &> /dev/null; then
                log "INFO" "Installing Chocolatey..."
                powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
            fi
            ;;
        *)
            log "ERROR" "Unsupported operating system: $OS"
            exit 1
            ;;
    esac
}

# Install Python
install_python() {
    log "INFO" "Installing Python..."

    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        log "INFO" "Python3 already installed: $PYTHON_VERSION"
    else
        case $OS in
            "ubuntu")
                sudo apt-get install -y python3 python3-pip python3-venv python3-dev
                ;;
            "centos"|"fedora")
                if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
                    sudo yum install -y python3 python3-pip python3-devel
                else
                    sudo dnf install -y python3 python3-pip python3-devel
                fi
                ;;
            "macos")
                brew install python3
                ;;
            "windows")
                choco install python3 -y
                ;;
        esac
        log "INFO" "Python3 installed successfully"
    fi
}

# Install Node.js
install_nodejs() {
    log "INFO" "Installing Node.js..."

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log "INFO" "Node.js already installed: $NODE_VERSION"
    else
        case $OS in
            "ubuntu")
                curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                sudo apt-get install -y nodejs
                ;;
            "centos"|"fedora")
                curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
                if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
                    sudo yum install -y nodejs npm
                else
                    sudo dnf install -y nodejs npm
                fi
                ;;
            "macos")
                brew install node
                ;;
            "windows")
                choco install nodejs -y
                ;;
        esac
        log "INFO" "Node.js installed successfully"
    fi
}

# Install PHP
install_php() {
    log "INFO" "Installing PHP..."

    if command -v php &> /dev/null; then
        PHP_VERSION=$(php --version | head -n1 | cut -d' ' -f2)
        log "INFO" "PHP already installed: $PHP_VERSION"
    else
        case $OS in
            "ubuntu")
                sudo apt-get install -y php php-cli php-common php-curl php-json php-mbstring php-zip
                ;;
            "centos"|"fedora")
                if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
                    sudo yum install -y php php-cli php-common php-curl php-json php-mbstring
                else
                    sudo dnf install -y php php-cli php-common php-curl php-json php-mbstring
                fi
                ;;
            "macos")
                brew install php
                ;;
            "windows")
                choco install php -y
                ;;
        esac
        log "INFO" "PHP installed successfully"
    fi

    # Install Composer
    if ! command -v composer &> /dev/null; then
        log "INFO" "Installing Composer..."
        php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
        php composer-setup.php --install-dir=/usr/local/bin --filename=composer
        php -r "unlink('composer-setup.php');"
        log "INFO" "Composer installed successfully"
    else
        log "INFO" "Composer already installed"
    fi
}

# Install Ruby
install_ruby() {
    log "INFO" "Installing Ruby..."

    if command -v ruby &> /dev/null; then
        RUBY_VERSION=$(ruby --version | cut -d' ' -f2)
        log "INFO" "Ruby already installed: $RUBY_VERSION"
    else
        case $OS in
            "ubuntu")
                sudo apt-get install -y ruby ruby-dev ruby-bundler
                ;;
            "centos"|"fedora")
                if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
                    sudo yum install -y ruby ruby-devel
                else
                    sudo dnf install -y ruby ruby-devel
                fi
                ;;
            "macos")
                brew install ruby
                ;;
            "windows")
                choco install ruby -y
                ;;
        esac
        log "INFO" "Ruby installed successfully"
    fi

    # Install Bundler
    if ! command -v bundle &> /dev/null; then
        log "INFO" "Installing Bundler..."
        gem install bundler
        log "INFO" "Bundler installed successfully"
    else
        log "INFO" "Bundler already installed"
    fi
}

# Install Java
install_java() {
    log "INFO" "Installing Java..."

    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2)
        log "INFO" "Java already installed: $JAVA_VERSION"
    else
        case $OS in
            "ubuntu")
                sudo apt-get install -y default-jdk maven
                ;;
            "centos"|"fedora")
                if [[ "$PACKAGE_MANAGER" == "yum" ]]; then
                    sudo yum install -y java-11-openjdk java-11-openjdk-devel maven
                else
                    sudo dnf install -y java-11-openjdk java-11-openjdk-devel maven
                fi
                ;;
            "macos")
                brew install openjdk maven
                ;;
            "windows")
                choco install openjdk maven -y
                ;;
        esac
        log "INFO" "Java and Maven installed successfully"
    fi
}

# Install project dependencies
install_project_deps() {
    log "INFO" "Installing project dependencies..."

    # Python dependencies
    if [[ -f "modules/requirements.txt" ]]; then
        log "INFO" "Installing Python dependencies from modules/requirements.txt..."
        pip3 install -r modules/requirements.txt 2>&1 | tee -a ./build_logs/pip_install.log
        log "INFO" "Python dependencies installed successfully"
    fi

    # Node.js dependencies
    if [[ -f "js_tools/messenger_bot_framework/fbbot/package.json" ]]; then
        log "INFO" "Installing Node.js dependencies for fbbot..."
        cd js_tools/messenger_bot_framework/fbbot
        npm ci 2>&1 | tee -a ../../../build_logs/npm_install.log
        cd ../../../
        log "INFO" "Node.js dependencies for fbbot installed successfully"
    fi

    if [[ -f "js_tools/facebook_mass_messenger/package.json" ]]; then
        log "INFO" "Installing Node.js dependencies for facebook_mass_messenger..."
        cd js_tools/facebook_mass_messenger
        npm ci 2>&1 | tee -a ../../build_logs/npm_install.log
        cd ../../
        log "INFO" "Node.js dependencies for facebook_mass_messenger installed successfully"
    fi

    if [[ -f "OSINT-Framework/package.json" ]]; then
        log "INFO" "Installing Node.js dependencies for OSINT-Framework..."
        cd OSINT-Framework
        npm ci 2>&1 | tee -a ../build_logs/npm_install.log
        cd ../
        log "INFO" "Node.js dependencies for OSINT-Framework installed successfully"
    fi

    # PHP dependencies (if composer.json exists)
    if [[ -f "composer.json" ]]; then
        log "INFO" "Installing PHP dependencies..."
        composer install 2>&1 | tee -a ./build_logs/composer_install.log
        log "INFO" "PHP dependencies installed successfully"
    fi

    # Ruby dependencies (if Gemfile exists)
    if [[ -f "Gemfile" ]]; then
        log "INFO" "Installing Ruby dependencies..."
        bundle install 2>&1 | tee -a ./build_logs/bundle_install.log
        log "INFO" "Ruby dependencies installed successfully"
    fi

    # Java dependencies
    if [[ -f "scripts/legacy/fb-botmill/pom.xml" ]]; then
        log "INFO" "Building Java project fb-botmill..."
        cd scripts/legacy/fb-botmill
        mvn clean package 2>&1 | tee -a ../../../build_logs/maven_build.log
        cd ../../../
        log "INFO" "Java project fb-botmill built successfully"
    fi
}

# Verify installations
verify_installations() {
    log "INFO" "Verifying installations..."

    # Check Python
    if command -v python3 &> /dev/null; then
        log "INFO" "✓ Python3: $(python3 --version)"
    else
        log "ERROR" "✗ Python3 not found"
    fi

    # Check Node.js
    if command -v node &> /dev/null; then
        log "INFO" "✓ Node.js: $(node --version)"
    else
        log "ERROR" "✗ Node.js not found"
    fi

    # Check PHP
    if command -v php &> /dev/null; then
        log "INFO" "✓ PHP: $(php --version | head -n1)"
    else
        log "ERROR" "✗ PHP not found"
    fi

    # Check Ruby
    if command -v ruby &> /dev/null; then
        log "INFO" "✓ Ruby: $(ruby --version)"
    else
        log "ERROR" "✗ Ruby not found"
    fi

    # Check Java
    if command -v java &> /dev/null; then
        log "INFO" "✓ Java: $(java -version 2>&1 | head -n1)"
    else
        log "ERROR" "✗ Java not found"
    fi

    # Check package managers
    if command -v pip3 &> /dev/null; then
        log "INFO" "✓ pip3: $(pip3 --version)"
    fi

    if command -v npm &> /dev/null; then
        log "INFO" "✓ npm: $(npm --version)"
    fi

    if command -v composer &> /dev/null; then
        log "INFO" "✓ Composer: $(composer --version)"
    fi

    if command -v bundle &> /dev/null; then
        log "INFO" "✓ Bundler: $(bundle --version)"
    fi

    if command -v mvn &> /dev/null; then
        log "INFO" "✓ Maven: $(mvn --version | head -n1)"
    fi
}

# Main execution
main() {
    log "INFO" "=== Starting Profil3r Setup ==="

    detect_os
    install_system_deps
    install_python
    install_nodejs
    install_php
    install_ruby
    install_java
    install_project_deps
    verify_installations

    log "INFO" "=== Setup completed successfully! ==="
    log "INFO" "Build logs can be found in ./build_logs/"

    echo ""
    echo -e "${GREEN}✓ Setup completed successfully!${NC}"
    echo -e "${BLUE}Build logs can be found in ./build_logs/${NC}"
    echo ""
    echo "Next steps:"
    echo "  - Run 'make build' to build all components"
    echo "  - Run 'make test' to run tests"
    echo "  - Run 'make deploy' to deploy the application"
}

# Run main function
main "$@"
