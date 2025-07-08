# Multi-stage Dockerfile for PHP Scripts
# Stage 1: Build dependencies
FROM php:8.2-cli-alpine as builder

# Set environment variables for Composer
# - COMPOSER_ALLOW_SUPERUSER: Allow Composer to run as root
# - COMPOSER_NO_INTERACTION: Disable interactive prompts in Composer
# - COMPOSER_CACHE_DIR: Set cache directory for Composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1 \
    COMPOSER_CACHE_DIR=/tmp/composer-cache

# Install system dependencies for building PHP extensions
# - curl: For HTTP requests
# - git: For Composer packages from git
# - zip, unzip: For archive handling
# - libzip-dev, libxml2-dev, libxslt-dev: Development headers
# - autoconf, gcc, g++, make: Build tools
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    libzip-dev \
    libxml2-dev \
    libxslt-dev \
    autoconf \
    gcc \
    g++ \
    make

# Install PHP extensions
RUN docker-php-ext-install \
    zip \
    xml \
    dom \
    curl \
    mbstring \
    json

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Create app directory
WORKDIR /app

# Copy PHP files to check for composer.json
COPY php_tools/ ./php_tools/

# Create a minimal composer.json if it doesn't exist
RUN if [ ! -f composer.json ]; then \
    echo '{"require": {"php": ">=8.0", "ext-curl": "*", "ext-json": "*", "ext-mbstring": "*"}}' > composer.json; \
    fi

# Install dependencies if composer.json exists
RUN if [ -f composer.json ]; then \
    composer install --no-dev --optimize-autoloader --no-cache; \
    fi

# Stage 2: Production image
FROM php:8.2-cli-alpine as production

# Set environment variables
ENV PHP_MEMORY_LIMIT=256M \
    PHP_MAX_EXECUTION_TIME=300

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    libzip \
    libxml2 \
    libxslt

# Install PHP extensions
RUN docker-php-ext-install \
    zip \
    xml \
    dom \
    curl \
    mbstring \
    json

# Configure PHP
RUN echo "memory_limit = ${PHP_MEMORY_LIMIT}" > /usr/local/etc/php/conf.d/memory.ini && \
    echo "max_execution_time = ${PHP_MAX_EXECUTION_TIME}" > /usr/local/etc/php/conf.d/execution.ini

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S phpuser && \
    adduser -S phpuser -u 1001 -G phpuser

# Copy vendor directory from builder (if exists)
COPY --from=builder /app/vendor/ ./vendor/

# Copy application files
COPY php_tools/ ./php_tools/
COPY config*.json ./

# Create directories for logs and results
RUN mkdir -p /app/logs /app/results && \
    chown -R phpuser:phpuser /app

# Switch to non-root user
USER phpuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD php --version || exit 1

# Default command
CMD ["php", "php_tools/facebook_scripts/check-fb-acc.php"]
