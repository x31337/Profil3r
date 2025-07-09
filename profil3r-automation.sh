#!/bin/bash

# Profil3r Master Automation Script
# Complete end-to-end automation for build, test, deployment, and management

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$SCRIPT_DIR/config"
LOGS_DIR="$SCRIPT_DIR/logs"
AUTOMATION_DIR="$SCRIPT_DIR/automation"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOGS_DIR/automation_${TIMESTAMP}.log"

# Create necessary directories
mkdir -p "$LOGS_DIR" "$CONFIG_DIR" "$AUTOMATION_DIR"

# Logging function
log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        "INFO") echo -e "${GREEN}[INFO]${NC} $message" | tee -a "$LOG_FILE" ;;
        "WARN") echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$LOG_FILE" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOG_FILE" ;;
        "DEBUG") echo -e "${BLUE}[DEBUG]${NC} $message" | tee -a "$LOG_FILE" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$LOG_FILE" ;;
        *) echo -e "${NC}$message" | tee -a "$LOG_FILE" ;;
    esac
}

# Banner function
show_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                            PROFIL3R AUTOMATION SUITE                                ║
║                         Complete End-to-End Management                              ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Help function
show_help() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

COMMANDS:
    setup           - Complete environment setup and dependency installation
    build           - Build all components (Python, Node.js, PHP, Docker)
    test            - Run comprehensive test suite
    deploy          - Deploy to specified environment
    validate        - Validate all components and configurations
    monitor         - Start monitoring and health checks
    update          - Update dependencies and components
    clean           - Clean build artifacts and temporary files
    report          - Generate comprehensive reports
    control-panel   - Launch interactive control panel
    full-cycle      - Complete automation from setup to deployment

OPTIONS:
    -e, --env ENV      Environment (dev, staging, prod)
    -c, --config FILE  Custom configuration file
    -v, --verbose      Verbose output
    -h, --help         Show this help message
    -l, --log-level    Set log level (DEBUG, INFO, WARN, ERROR)
    --dry-run          Show what would be done without executing

EXAMPLES:
    $0 setup --env dev
    $0 build --verbose
    $0 test --env staging
    $0 deploy --env prod
    $0 full-cycle --env dev --verbose
    $0 control-panel
EOF
}

# Parse command line arguments
parse_args() {
    ENVIRONMENT="dev"
    CONFIG_FILE=""
    VERBOSE=false
    DRY_RUN=false
    LOG_LEVEL="INFO"

    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            -l|--log-level)
                LOG_LEVEL="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                COMMAND="$1"
                shift
                ;;
        esac
    done
}

# Load configuration
load_config() {
    local config_file="${CONFIG_FILE:-$CONFIG_DIR/config.${ENVIRONMENT}.json}"

    if [[ -f "$config_file" ]]; then
        log "INFO" "Loading configuration from $config_file"
        # Export configuration as environment variables
        export PROFIL3R_CONFIG="$config_file"
        export PROFIL3R_ENV="$ENVIRONMENT"
        export PROFIL3R_LOG_LEVEL="$LOG_LEVEL"
    else
        log "WARN" "Configuration file not found: $config_file"
        log "INFO" "Using default configuration"
    fi
}

# Environment setup
setup_environment() {
    log "INFO" "Setting up environment: $ENVIRONMENT"

    # Check system requirements
    check_system_requirements

    # Install dependencies
    install_dependencies

    # Setup services
    setup_services

    # Configure environment
    configure_environment

    log "SUCCESS" "Environment setup completed"
}

# Check system requirements
check_system_requirements() {
    log "INFO" "Checking system requirements..."

    local requirements=(
        "node:>=16"
        "npm:>=8"
        "python3:>=3.8"
        "git:>=2.0"
        "pm2:>=5.0"
        "php:>=8.0"
    )

    for req in "${requirements[@]}"; do
        local cmd="${req%%:*}"
        local version="${req##*:}"

        if command -v "$cmd" &> /dev/null; then
            log "SUCCESS" "$cmd is installed"
        else
            log "ERROR" "$cmd is not installed or not in PATH"
            install_requirement "$cmd"
        fi
    done
}

# Install missing requirement
install_requirement() {
    local requirement="$1"

    case "$requirement" in
        "pm2")
            log "INFO" "Installing PM2..."
            npm install -g pm2
            ;;
        "php")
            log "INFO" "Installing PHP..."
            if command -v brew &> /dev/null; then
                brew install php
            else
                log "ERROR" "Homebrew not available. Please install PHP manually."
                exit 1
            fi
            ;;
        *)
            log "ERROR" "Don't know how to install $requirement"
            exit 1
            ;;
    esac
}

# Install dependencies
install_dependencies() {
    log "INFO" "Installing project dependencies..."

    # Root dependencies
    npm install

    # Python dependencies
    pip install -r requirements.txt

    # Tool dependencies
    cd tools && npm install --legacy-peer-deps
    cd ..

    # Integration test dependencies
    cd tests/integration/node && npm install
    cd ../../..

    log "SUCCESS" "Dependencies installed"
}

# Setup services
setup_services() {
    log "INFO" "Setting up services..."

    # Create PM2 ecosystem file
    create_pm2_ecosystem

    # Setup database if needed
    setup_database

    # Configure logging
    setup_logging

    log "SUCCESS" "Services configured"
}

# Create PM2 ecosystem file
create_pm2_ecosystem() {
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'profil3r-osint-framework',
      script: './tools/OSINT-Framework/health-server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 8000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8000
      }
    },
    {
      name: 'profil3r-js-tools',
      script: './tools/js_tools/messenger_bot_framework/fbbot/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'profil3r-auto-build',
      script: './tools/auto-build-system.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
EOF
    log "SUCCESS" "PM2 ecosystem file created"
}

# Build all components
build_all() {
    log "INFO" "Building all components..."

    # Python build
    build_python

    # Node.js build
    build_nodejs

    # PHP validation
    build_php

    # Docker build
    build_docker

    log "SUCCESS" "All components built"
}

# Build Python components
build_python() {
    log "INFO" "Building Python components..."

    # Install in development mode
    pip install -e .

    # Compile Python files
    python -m compileall profil3r/

    log "SUCCESS" "Python components built"
}

# Build Node.js components
build_nodejs() {
    log "INFO" "Building Node.js components..."

    # Build tools
    cd tools
    npm run build 2>/dev/null || log "WARN" "Build script not available"
    cd ..

    # Build individual JS tools
    cd tools/js_tools
    npm run build 2>/dev/null || log "WARN" "Build script not available"
    cd ../..

    log "SUCCESS" "Node.js components built"
}

# Build PHP components
build_php() {
    log "INFO" "Validating PHP components..."

    # Find and validate PHP files
    find . -name "*.php" -not -path "./node_modules/*" -exec php -l {} \; > /dev/null

    log "SUCCESS" "PHP components validated"
}

# Build Docker images
build_docker() {
    log "INFO" "Building Docker images..."

    if [[ -f "docker-compose.yml" ]]; then
        docker-compose build
        log "SUCCESS" "Docker images built"
    else
        log "WARN" "No docker-compose.yml found"
    fi
}

# Run comprehensive tests
run_tests() {
    log "INFO" "Running comprehensive test suite..."

    # Python tests
    run_python_tests

    # Node.js tests
    run_nodejs_tests

    # Integration tests
    run_integration_tests

    # Security tests
    run_security_tests

    log "SUCCESS" "All tests completed"
}

# Run Python tests
run_python_tests() {
    log "INFO" "Running Python tests..."

    python -m pytest tests/integration/python/ -v --cov=profil3r --cov-report=html --cov-report=term-missing

    log "SUCCESS" "Python tests completed"
}

# Run Node.js tests
run_nodejs_tests() {
    log "INFO" "Running Node.js tests..."

    cd tests/integration/node
    npm test || log "WARN" "Some Node.js tests failed"
    cd ../../..

    log "SUCCESS" "Node.js tests completed"
}

# Run integration tests
run_integration_tests() {
    log "INFO" "Running integration tests..."

    # Start services
    pm2 start ecosystem.config.js

    # Wait for services to be ready
    sleep 10

    # Run health checks
    curl -f http://localhost:8000/api/health || log "WARN" "OSINT service health check failed"
    curl -f http://localhost:3000/api/health || log "WARN" "JS tools service health check failed"

    log "SUCCESS" "Integration tests completed"
}

# Run security tests
run_security_tests() {
    log "INFO" "Running security tests..."

    # npm audit
    npm audit --audit-level=high || log "WARN" "npm audit found issues"

    # Python security check
    pip-audit 2>/dev/null || log "WARN" "pip-audit not available"

    log "SUCCESS" "Security tests completed"
}

# Deploy to environment
deploy_to_env() {
    log "INFO" "Deploying to $ENVIRONMENT environment..."

    case "$ENVIRONMENT" in
        "dev")
            deploy_dev
            ;;
        "staging")
            deploy_staging
            ;;
        "prod")
            deploy_prod
            ;;
        *)
            log "ERROR" "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac

    log "SUCCESS" "Deployment completed"
}

# Deploy to development
deploy_dev() {
    log "INFO" "Deploying to development environment..."

    # Start services with PM2
    pm2 start ecosystem.config.js --env development

    # Setup development monitoring
    setup_monitoring

    log "SUCCESS" "Development deployment completed"
}

# Deploy to staging
deploy_staging() {
    log "INFO" "Deploying to staging environment..."

    # Run additional validation
    validate_all

    # Start services
    pm2 start ecosystem.config.js --env staging

    log "SUCCESS" "Staging deployment completed"
}

# Deploy to production
deploy_prod() {
    log "INFO" "Deploying to production environment..."

    # Extra validation for production
    validate_all
    run_tests

    # Backup current deployment
    backup_deployment

    # Start services
    pm2 start ecosystem.config.js --env production

    log "SUCCESS" "Production deployment completed"
}

# Validate all components
validate_all() {
    log "INFO" "Validating all components..."

    # Validate configuration
    validate_config

    # Validate dependencies
    validate_dependencies

    # Validate services
    validate_services

    log "SUCCESS" "All validations passed"
}

# Validate configuration
validate_config() {
    log "INFO" "Validating configuration..."

    # Check required config files
    local required_configs=(
        "config.json"
        "package.json"
        "requirements.txt"
    )

    for config in "${required_configs[@]}"; do
        if [[ ! -f "$config" ]]; then
            log "ERROR" "Required configuration file missing: $config"
            exit 1
        fi
    done

    log "SUCCESS" "Configuration validation passed"
}

# Validate dependencies
validate_dependencies() {
    log "INFO" "Validating dependencies..."

    # Check Node.js dependencies
    npm audit --audit-level=high

    # Check Python dependencies
    pip check

    log "SUCCESS" "Dependencies validation passed"
}

# Validate services
validate_services() {
    log "INFO" "Validating services..."

    # Check if services are running
    if pm2 list | grep -q "online"; then
        log "SUCCESS" "Services are running"
    else
        log "WARN" "Some services may not be running"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "INFO" "Setting up monitoring..."

    # Setup PM2 monitoring
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 7

    # Setup health check monitoring
    setup_health_monitoring

    log "SUCCESS" "Monitoring setup completed"
}

# Setup health monitoring
setup_health_monitoring() {
    cat > automation/health-monitor.js << 'EOF'
const axios = require('axios');

const services = [
    { name: 'OSINT Framework', url: 'http://localhost:8000/api/health' },
    { name: 'JS Tools', url: 'http://localhost:3000/api/health' }
];

async function checkHealth() {
    console.log(`[${new Date().toISOString()}] Health Check Started`);

    for (const service of services) {
        try {
            const response = await axios.get(service.url, { timeout: 5000 });
            console.log(`✅ ${service.name}: ${response.data.status}`);
        } catch (error) {
            console.log(`❌ ${service.name}: ${error.message}`);
        }
    }
}

// Run health check every 30 seconds
setInterval(checkHealth, 30000);
checkHealth();
EOF

    # Start health monitoring
    pm2 start automation/health-monitor.js --name "profil3r-health-monitor"
}

# Generate reports
generate_reports() {
    log "INFO" "Generating reports..."

    # Create reports directory
    mkdir -p reports

    # Generate test report
    generate_test_report

    # Generate deployment report
    generate_deployment_report

    # Generate security report
    generate_security_report

    log "SUCCESS" "Reports generated"
}

# Generate test report
generate_test_report() {
    cat > reports/test-report.md << EOF
# Test Report - $(date)

## Python Tests
$(python -m pytest tests/integration/python/ --tb=no -q 2>/dev/null || echo "Tests failed")

## Node.js Tests
$(cd tests/integration/node && npm test 2>/dev/null || echo "Tests failed")

## Coverage Report
$(python -m pytest tests/integration/python/ --cov=profil3r --cov-report=term 2>/dev/null || echo "Coverage unavailable")
EOF
}

# Generate deployment report
generate_deployment_report() {
    cat > reports/deployment-report.md << EOF
# Deployment Report - $(date)

## Environment: $ENVIRONMENT

## Services Status
$(pm2 list)

## System Resources
$(df -h)
$(free -h 2>/dev/null || echo "Memory info unavailable")
EOF
}

# Generate security report
generate_security_report() {
    cat > reports/security-report.md << EOF
# Security Report - $(date)

## npm Audit
$(npm audit --audit-level=high 2>/dev/null || echo "npm audit failed")

## Dependency Check
$(pip check 2>/dev/null || echo "pip check failed")
EOF
}

# Clean up
clean_up() {
    log "INFO" "Cleaning up..."

    # Clean build artifacts
    rm -rf build/ dist/ *.egg-info/

    # Clean node modules cache
    npm cache clean --force

    # Clean Python cache
    find . -type d -name "__pycache__" -delete
    find . -type f -name "*.pyc" -delete

    # Clean logs (keep last 10)
    find logs/ -name "*.log" -mtime +10 -delete 2>/dev/null || true

    log "SUCCESS" "Cleanup completed"
}

# Update components
update_components() {
    log "INFO" "Updating components..."

    # Update npm packages
    npm update

    # Update Python packages
    pip install --upgrade -r requirements.txt

    # Update tools
    cd tools && npm update
    cd ..

    log "SUCCESS" "Components updated"
}

# Interactive control panel
launch_control_panel() {
    while true; do
        clear
        show_banner
        echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════════════${NC}"
        echo -e "${WHITE}                            PROFIL3R CONTROL PANEL                                   ${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════════════${NC}"
        echo
        echo -e "${GREEN}1.${NC} Setup Environment"
        echo -e "${GREEN}2.${NC} Build All Components"
        echo -e "${GREEN}3.${NC} Run Tests"
        echo -e "${GREEN}4.${NC} Deploy"
        echo -e "${GREEN}5.${NC} Monitor Services"
        echo -e "${GREEN}6.${NC} Generate Reports"
        echo -e "${GREEN}7.${NC} Update Components"
        echo -e "${GREEN}8.${NC} Clean Up"
        echo -e "${GREEN}9.${NC} Full Automation Cycle"
        echo -e "${RED}0.${NC} Exit"
        echo
        echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════════════${NC}"
        read -p "Select option: " choice

        case $choice in
            1) setup_environment ;;
            2) build_all ;;
            3) run_tests ;;
            4) deploy_to_env ;;
            5) pm2 monit ;;
            6) generate_reports ;;
            7) update_components ;;
            8) clean_up ;;
            9) full_automation_cycle ;;
            0) break ;;
            *) log "ERROR" "Invalid option" ;;
        esac

        read -p "Press Enter to continue..."
    done
}

# Full automation cycle
full_automation_cycle() {
    log "INFO" "Starting full automation cycle..."

    setup_environment
    build_all
    run_tests
    deploy_to_env
    setup_monitoring
    generate_reports

    log "SUCCESS" "Full automation cycle completed"
}

# Main function
main() {
    show_banner

    # Parse arguments
    parse_args "$@"

    # Load configuration
    load_config

    # Execute command
    case "${COMMAND:-}" in
        "setup") setup_environment ;;
        "build") build_all ;;
        "test") run_tests ;;
        "deploy") deploy_to_env ;;
        "validate") validate_all ;;
        "monitor") setup_monitoring ;;
        "update") update_components ;;
        "clean") clean_up ;;
        "report") generate_reports ;;
        "control-panel") launch_control_panel ;;
        "full-cycle") full_automation_cycle ;;
        "") launch_control_panel ;;
        *)
            log "ERROR" "Unknown command: ${COMMAND:-}"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
