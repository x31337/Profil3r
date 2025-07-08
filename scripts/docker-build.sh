#!/bin/bash

# Unified Docker Build and Deployment Script for Profil3r
# This script centralizes all Docker operations for the Profil3r project

set -euo pipefail

# Configuration
PROJECT_NAME="profil3r"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"
VERSION="${VERSION:-$(git describe --tags --always --dirty 2>/dev/null || echo 'latest')}"
BUILD_CONTEXT="."
DOCKER_DIR="docker"

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

# Component definitions
declare -A COMPONENTS=(
    ["core"]="python.dockerfile"
    ["js-tools"]="node.dockerfile"
    ["php-tools"]="php.dockerfile"
    ["ruby-reporter"]="ruby.dockerfile"
)

# Docker build function
build_image() {
    local component=$1
    local dockerfile=$2
    local full_image_name="${DOCKER_REGISTRY}/${PROJECT_NAME}-${component}:${VERSION}"
    local latest_image_name="${DOCKER_REGISTRY}/${PROJECT_NAME}-${component}:latest"
    
    log_info "Building ${component} image..."
    
    # Build with version tag
    docker build \
        -f "${DOCKER_DIR}/${dockerfile}" \
        -t "${full_image_name}" \
        -t "${latest_image_name}" \
        --build-arg VERSION="${VERSION}" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" \
        "${BUILD_CONTEXT}"
    
    log_success "Built ${component} image: ${full_image_name}"
    
    # Return image names for later use
    echo "${full_image_name},${latest_image_name}"
}

# Push images to registry
push_images() {
    local component=$1
    local images=$2
    
    log_info "Pushing ${component} images..."
    
    IFS=',' read -ra IMAGE_ARRAY <<< "$images"
    for image in "${IMAGE_ARRAY[@]}"; do
        docker push "${image}"
        log_success "Pushed ${image}"
    done
}

# Security scan
scan_image() {
    local image=$1
    
    if command -v docker-scan &> /dev/null; then
        log_info "Scanning ${image} for vulnerabilities..."
        docker scan "${image}" || log_warning "Security scan failed for ${image}"
    elif command -v trivy &> /dev/null; then
        log_info "Scanning ${image} with Trivy..."
        trivy image "${image}" || log_warning "Trivy scan failed for ${image}"
    else
        log_warning "No security scanner found (docker-scan or trivy)"
    fi
}

# Create docker-compose override for development
create_dev_override() {
    cat > docker-compose.override.yml << 'EOF'
version: '3.8'

services:
  profil3r-core:
    build:
      context: .
      dockerfile: docker/python.dockerfile
      target: development
    volumes:
      - .:/app
      - /app/__pycache__
    environment:
      - FLASK_ENV=development
      - PYTHONDONTWRITEBYTECODE=1
    command: python -m flask run --host=0.0.0.0 --port=8000 --reload

  js-tools:
    build:
      context: .
      dockerfile: docker/node.dockerfile
      target: development
    volumes:
      - ./js_tools:/app/js_tools
      - /app/js_tools/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  php-tools:
    build:
      context: .
      dockerfile: docker/php.dockerfile
      target: development
    volumes:
      - ./php_tools:/app/php_tools
    environment:
      - PHP_ENV=development

  ruby-reporter:
    build:
      context: .
      dockerfile: docker/ruby.dockerfile
      target: development
    volumes:
      - ./scripts:/app/scripts
    environment:
      - RUBY_ENV=development
EOF
    
    log_success "Created docker-compose.override.yml for development"
}

# Main build function
build_all() {
    local push_flag=$1
    local scan_flag=$2
    
    log_info "Starting unified build process for Profil3r v${VERSION}"
    
    # Create necessary directories
    mkdir -p logs results config
    
    # Build all components
    declare -A built_images
    for component in "${!COMPONENTS[@]}"; do
        dockerfile="${COMPONENTS[$component]}"
        images=$(build_image "$component" "$dockerfile")
        built_images["$component"]="$images"
        
        # Security scan if requested
        if [ "$scan_flag" = true ]; then
            IFS=',' read -ra IMAGE_ARRAY <<< "$images"
            scan_image "${IMAGE_ARRAY[0]}"
        fi
    done
    
    # Push images if requested
    if [ "$push_flag" = true ]; then
        for component in "${!built_images[@]}"; do
            push_images "$component" "${built_images[$component]}"
        done
    fi
    
    log_success "All components built successfully!"
}

# Deploy function
deploy() {
    local environment=$1
    local compose_file="docker-compose.yml"
    
    case $environment in
        "dev"|"development")
            create_dev_override
            compose_file="docker-compose.yml"
            ;;
        "prod"|"production")
            compose_file="docker-compose.prod.yml"
            ;;
        *)
            log_error "Unknown environment: $environment"
            exit 1
            ;;
    esac
    
    log_info "Deploying to $environment environment..."
    
    # Update images in docker-compose with current version
    export VERSION
    docker-compose -f "$compose_file" pull
    docker-compose -f "$compose_file" up -d
    
    log_success "Deployment completed!"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up Docker resources..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed!"
}

# Health check function
health_check() {
    log_info "Running health checks..."
    
    # Check if all services are running
    services=("profil3r-core" "profil3r-js-tools" "profil3r-php-tools" "profil3r-ruby-reporter")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            log_success "$service is running"
        else
            log_error "$service is not running"
        fi
    done
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
    build           Build all Docker images
    deploy ENV      Deploy to environment (dev/prod)
    cleanup         Clean up Docker resources
    health          Check service health
    help            Show this help message

Options:
    --push          Push images to registry after building
    --scan          Run security scans on images
    --version VER   Specify version tag (default: git describe)
    --registry REG  Specify Docker registry (default: localhost:5000)

Examples:
    $0 build --push --scan
    $0 deploy dev
    $0 deploy prod
    $0 cleanup
    $0 health

Environment Variables:
    DOCKER_REGISTRY   Docker registry URL
    VERSION          Version tag for images
EOF
}

# Main script logic
main() {
    local command=""
    local push_flag=false
    local scan_flag=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            build)
                command="build"
                shift
                ;;
            deploy)
                command="deploy"
                environment="$2"
                shift 2
                ;;
            cleanup)
                command="cleanup"
                shift
                ;;
            health)
                command="health"
                shift
                ;;
            help|--help|-h)
                usage
                exit 0
                ;;
            --push)
                push_flag=true
                shift
                ;;
            --scan)
                scan_flag=true
                shift
                ;;
            --version)
                VERSION="$2"
                shift 2
                ;;
            --registry)
                DOCKER_REGISTRY="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Execute command
    case $command in
        "build")
            build_all "$push_flag" "$scan_flag"
            ;;
        "deploy")
            deploy "$environment"
            ;;
        "cleanup")
            cleanup
            ;;
        "health")
            health_check
            ;;
        *)
            log_error "No command specified"
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
