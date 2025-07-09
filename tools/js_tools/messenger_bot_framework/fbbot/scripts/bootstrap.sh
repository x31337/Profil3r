#!/bin/bash

# Bootstrap script for local development
# This script sets up the development environment with Docker services,
# file watching, and health checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check version requirements
check_version() {
    local cmd="$1"
    local min_version="$2"
    local current_version

    if ! command_exists "$cmd"; then
        log_error "$cmd is not installed or not in PATH"
        return 1
    fi

    current_version=$("$cmd" --version 2>&1 | head -n1)
    log_info "$cmd version: $current_version"
    return 0
}

# Verify Docker, Node, and Python versions
check_versions() {
    log_info "Checking Docker, Node, and Python versions..."

    # Check Docker
    if ! check_version "docker" "20.10.0"; then
        log_error "Docker is required. Please install Docker Desktop or Docker Engine."
        exit 1
    fi

    # Check Docker Compose
    if ! command_exists "docker-compose" && ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose is required. Please install Docker Compose."
        exit 1
    fi

    # Check Node.js
    if ! check_version "node" "16.0.0"; then
        log_error "Node.js 16+ is required. Please install Node.js from https://nodejs.org/"
        exit 1
    fi

    # Check Python
    if ! check_version "python" "3.8.0" && ! check_version "python3" "3.8.0"; then
        log_error "Python 3.8+ is required. Please install Python from https://python.org/"
        exit 1
    fi

    log_success "All required dependencies are installed"
}

# Stop existing containers
stop_existing_containers() {
    log_info "Stopping existing containers..."
    docker compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
}

# Run docker-compose for development
run_docker_compose() {
    log_info "Building and starting Docker services..."

    # Ensure we're in the right directory
    if [ ! -f "docker-compose.dev.yml" ]; then
        log_error "docker-compose.dev.yml not found. Please run this script from the project root."
        exit 1
    fi

    # Build and start services
    docker compose -f docker-compose.dev.yml up --build -d

    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
}

# Execute make build inside each service (if Makefile exists)
build_services() {
    log_info "Building services..."

    services=("profil3r-python" "profil3r-node" "profil3r-php" "profil3r-ruby" "profil3r-core")

    for service in "${services[@]}"; do
        log_info "Checking build requirements for $service..."

        # Check if container is running
        if ! docker ps --format "table {{.Names}}" | grep -q "$service"; then
            log_warning "$service is not running, skipping build"
            continue
        fi

        # Check if Makefile exists in the container
        if docker exec "$service" test -f Makefile 2>/dev/null; then
            log_info "Building $service..."
            docker exec "$service" make build || log_warning "Build failed for $service"
        else
            log_info "No Makefile found in $service, skipping build"
        fi
    done
}

# Health check function
check_service_health() {
    local service="$1"
    local port="$2"

    if docker ps --format "table {{.Names}}" | grep -q "$service"; then
        if curl -f -s "http://localhost:$port" >/dev/null 2>&1; then
            log_success "$service is healthy (port $port)"
        else
            log_warning "$service is running but not responding on port $port"
        fi
    else
        log_error "$service is not running"
    fi
}

# Perform first-run health checks and print next-steps
health_checks_and_next_steps() {
    log_info "Performing health checks..."

    # Define service ports based on docker-compose.dev.yml
    services="profil3r-python:5001 profil3r-node:3001 profil3r-php:80 profil3r-ruby:4567 profil3r-core:8001"

    # Check each service
    for service_info in $services; do
        service_name=$(echo $service_info | cut -d: -f1)
        service_port=$(echo $service_info | cut -d: -f2)
        check_service_health "$service_name" "$service_port"
    done

    log_success "Health checks completed"

    # Print next steps
    echo
    log_info "🚀 Development environment is ready!"
    echo
    echo "Available services:"
    echo "  • Python Flask: http://localhost:5001"
    echo "  • Node.js:      http://localhost:3001"
    echo "  • PHP:          http://localhost:80"
    echo "  • Ruby:         http://localhost:4567"
    echo "  • Core:         http://localhost:8001"
    echo
    echo "Useful commands:"
    echo "  • View logs:           docker compose -f docker-compose.dev.yml logs -f [service]"
    echo "  • Restart service:     docker compose -f docker-compose.dev.yml restart [service]"
    echo "  • Stop all services:   docker compose -f docker-compose.dev.yml down"
    echo "  • Rebuild service:     docker compose -f docker-compose.dev.yml up --build [service]"
    echo
}

# Setup file watching for development
setup_file_watching() {
    log_info "Setting up file watching for development..."

    # Create a docker-compose.watch.yml file for file watching
    cat > docker-compose.watch.yml << 'EOF'
version: '3.8'

services:
  profil3r-python:
    extends:
      file: docker-compose.dev.yml
      service: profil3r-python
    develop:
      watch:
        - action: sync
          path: .
          target: /app
          ignore:
            - node_modules/
            - __pycache__/
        - action: restart
          path: requirements.txt
    command: |
      sh -c '
        pip install watchdog &&
        watchmedo auto-restart --directory=/app --pattern="*.py" --recursive -- python -m flask run --host=0.0.0.0 --debug
      '

  profil3r-node:
    extends:
      file: docker-compose.dev.yml
      service: profil3r-node
    develop:
      watch:
        - action: sync
          path: .
          target: /app
          ignore:
            - node_modules/
            - __pycache__/
        - action: restart
          path: package.json
    command: |
      sh -c '
        npm install -g nodemon &&
        nodemon --watch . --ext js,json --ignore node_modules/ index.js
      '

  profil3r-php:
    extends:
      file: docker-compose.dev.yml
      service: profil3r-php
    develop:
      watch:
        - action: sync
          path: .
          target: /var/www/html
          ignore:
            - node_modules/
            - vendor/
        - action: restart
          path: composer.json

  profil3r-ruby:
    extends:
      file: docker-compose.dev.yml
      service: profil3r-ruby
    develop:
      watch:
        - action: sync
          path: .
          target: /app
          ignore:
            - node_modules/
            - vendor/
        - action: restart
          path: Gemfile
    command: |
      sh -c '
        gem install rerun &&
        rerun --background --pattern "**/*.rb" -- ruby app.rb -o 0.0.0.0
      '

  profil3r-core:
    extends:
      file: docker-compose.dev.yml
      service: profil3r-core
    develop:
      watch:
        - action: sync
          path: .
          target: /app
          ignore:
            - node_modules/
            - __pycache__/
EOF

    log_success "File watching configuration created"
    log_info "To enable file watching, run: docker compose -f docker-compose.dev.yml -f docker-compose.watch.yml watch"
}

# Install development tools in containers
install_dev_tools() {
    log_info "Installing development tools in containers..."

    # Python: Install watchdog for file watching
    if docker ps --format "table {{.Names}}" | grep -q "fbbot-profil3r-python"; then
        log_info "Installing Python development tools..."
        docker exec fbbot-profil3r-python-1 sh -c "pip install watchdog" || log_warning "Failed to install watchdog"
    fi

    # Node.js: Install nodemon for file watching
    if docker ps --format "table {{.Names}}" | grep -q "fbbot-profil3r-node"; then
        log_info "Installing Node.js development tools..."
        docker exec fbbot-profil3r-node-1 sh -c "npm install -g nodemon" || log_warning "Failed to install nodemon"
    fi

    # Ruby: Install rerun for file watching
    if docker ps --format "table {{.Names}}" | grep -q "fbbot-profil3r-ruby"; then
        log_info "Installing Ruby development tools..."
        docker exec fbbot-profil3r-ruby-1 sh -c "gem install rerun" || log_warning "Failed to install rerun"
    fi

    log_success "Development tools installation completed"
}

# Main execution
main() {
    log_info "Starting development environment bootstrap..."

    check_versions
    stop_existing_containers
    run_docker_compose
    build_services
    install_dev_tools
    setup_file_watching
    health_checks_and_next_steps

    log_success "🎉 Bootstrap completed successfully!"
    log_info "Your development environment is ready to use."
}

# Run main function
main "$@"
