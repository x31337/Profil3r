#!/bin/bash

# Profil3r Auto Build System Startup Script
# This script installs dependencies and starts the auto-build system

set -e

echo "🚀 Starting Profil3r Auto Build System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION"
}

# Install dependencies
install_dependencies() {
    print_header "📦 Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install auto-build system dependencies
    print_status "Installing auto-build system dependencies..."
    npm install express ws chokidar axios simple-git pm2 nyc
    
    # Install Cypress and related dependencies
    print_status "Installing Cypress and testing dependencies..."
    npm install cypress cypress-image-snapshot concurrently eslint wait-on
    
    print_status "Dependencies installed successfully!"
}

# Create necessary directories
create_directories() {
    print_header "📁 Creating directories..."
    
    mkdir -p build
    mkdir -p logs
    mkdir -p cypress/videos
    mkdir -p cypress/screenshots
    mkdir -p cypress/support
    
    print_status "Directories created successfully!"
}

# Setup Cypress support files
setup_cypress_support() {
    print_header "🔧 Setting up Cypress support files..."
    
    # Create cypress support files if they don't exist
    if [ ! -f "cypress/support/e2e.js" ]; then
        cat > cypress/support/e2e.js << 'EOF'
// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for auto-build system
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  cy.focused().then(($el) => {
    if ($el.length) {
      cy.wrap($el).trigger('keydown', { keyCode: 9, which: 9 })
    } else {
      cy.get('body').trigger('keydown', { keyCode: 9, which: 9 })
    }
  })
})

// Add image snapshot support
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';
addMatchImageSnapshotCommand();
EOF
        print_status "Created cypress/support/e2e.js"
    fi
    
    if [ ! -f "cypress/support/commands.js" ]; then
        cat > cypress/support/commands.js << 'EOF'
// Custom commands for auto-build system testing

Cypress.Commands.add('waitForAutoBuildSystem', () => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('auto_build_url')}/api/status`,
    timeout: 30000,
    retryOnStatusCodeFailure: true
  }).then(response => {
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add('triggerBuild', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('auto_build_url')}/api/build`,
    timeout: 60000
  }).then(response => {
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add('triggerTest', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('auto_build_url')}/api/test`,
    timeout: 60000
  }).then(response => {
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add('checkServiceHealth', (serviceName, url) => {
  cy.task('healthCheck', url).then(result => {
    cy.log(`${serviceName} health: ${result.status}`);
    return result;
  });
});
EOF
        print_status "Created cypress/support/commands.js"
    fi
}

# Fix file permissions
fix_permissions() {
    print_header "🔒 Setting file permissions..."
    
    # Make scripts executable
    chmod +x auto-build-system.js
    chmod +x start-auto-build.sh
    
    print_status "File permissions set successfully!"
}

# Check if auto-build system is already running
check_running() {
    if pgrep -f "auto-build-system.js" > /dev/null; then
        print_warning "Auto-build system is already running!"
        read -p "Do you want to restart it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Stopping existing auto-build system..."
            pkill -f "auto-build-system.js" || true
            sleep 2
        else
            print_status "Exiting..."
            exit 0
        fi
    fi
}

# Start the auto-build system
start_auto_build() {
    print_header "🚀 Starting Auto Build System..."
    
    # Start in background with PM2 if available
    if command -v pm2 &> /dev/null; then
        print_status "Starting with PM2..."
        pm2 start auto-build-system.js --name "profil3r-auto-build"
        pm2 save
        print_status "Auto-build system started with PM2"
        print_status "Use 'pm2 logs profil3r-auto-build' to view logs"
        print_status "Use 'pm2 stop profil3r-auto-build' to stop"
    else
        print_status "Starting in background..."
        nohup node auto-build-system.js > logs/auto-build.log 2>&1 &
        echo $! > logs/auto-build.pid
        print_status "Auto-build system started in background"
        print_status "PID: $(cat logs/auto-build.pid)"
    fi
    
    # Wait for services to start
    sleep 5
    
    # Check if services are running
    if curl -s "http://localhost:9000/api/status" > /dev/null; then
        print_status "✅ Auto-build system is running!"
        print_status "🌐 Web Dashboard: http://localhost:9000"
        print_status "📡 WebSocket: ws://localhost:9001"
    else
        print_error "❌ Auto-build system failed to start"
        exit 1
    fi
}

# Run health check
run_health_check() {
    print_header "🏥 Running health check..."
    
    # Check auto-build system API
    if curl -s "http://localhost:9000/api/status" > /dev/null; then
        print_status "✅ Auto-build system API is healthy"
    else
        print_warning "⚠️  Auto-build system API is not responding"
    fi
    
    # Check services
    SERVICES=("http://localhost:8000" "http://localhost:3000" "http://localhost:4444")
    SERVICE_NAMES=("OSINT Framework" "Messenger Bot" "Mass Messenger")
    
    for i in "${!SERVICES[@]}"; do
        if curl -s "${SERVICES[$i]}" > /dev/null; then
            print_status "✅ ${SERVICE_NAMES[$i]} is healthy"
        else
            print_warning "⚠️  ${SERVICE_NAMES[$i]} is not responding"
        fi
    done
}

# Main execution
main() {
    print_header "🔧 Profil3r Auto Build System Setup"
    
    # Pre-flight checks
    check_nodejs
    check_npm
    check_running
    
    # Setup
    install_dependencies
    create_directories
    setup_cypress_support
    fix_permissions
    
    # Start system
    start_auto_build
    
    # Post-start checks
    run_health_check
    
    print_header "🎉 Setup completed successfully!"
    echo
    print_status "Next steps:"
    echo "  1. Open http://localhost:9000 to view the dashboard"
    echo "  2. Run 'npm run test-e2e' to run Cypress tests"
    echo "  3. Run 'npm run auto-build-logs' to view logs"
    echo "  4. Run 'npm run auto-build-stop' to stop the system"
    echo
    print_status "The auto-build system will now monitor for file changes and automatically:"
    echo "  - Build and compile all components"
    echo "  - Run tests with 100% coverage"
    echo "  - Fix code issues automatically"
    echo "  - Push changes to git repository"
    echo
    print_status "Happy coding! 🚀"
}

# Run main function
main "$@"
