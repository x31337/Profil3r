# Use the PHP 8.2 CLI base image on Alpine for slim PHP environment
FROM php:8.2-cli-alpine

# Install system dependencies for composer and PHP extensions
# git for composer, curl & unzip for general purpose or composer packages
# php82-extensions for common PHP functionalities
RUN apk add --no-cache \
    git \
    curl \
    unzip \
    $PHPIZE_DEPS \
    php82-curl \
    php82-json \
    php82-mbstring

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the working directory
WORKDIR /app

# Copy composer.json (and lock file if it exists)
# These are relative to the Dockerfile's location (tools/php_tools/)
COPY ../../composer.json /app/
# COPY ../../composer.lock /app/ # Uncomment if you have a composer.lock

# Install PHP dependencies
# --no-interaction for CI/CD environments
# --no-plugins, --no-scripts can be added for security if not needed
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application source code
# Source (src), public assets (public), templates (templates)
# These paths are relative to the Dockerfile's location (tools/php_tools/)
COPY ../../src/ /app/src/
COPY ../../public/ /app/public/
COPY ../../templates/ /app/templates/

# Copy the original Facebook PHP scripts for the tool discovery feature
# This places tools/php_tools/facebook_scripts/* into /app/tools/php_tools/facebook_scripts/*
COPY ./facebook_scripts/ /app/tools/php_tools/facebook_scripts/

# Define an optional volume for storing sensitive credentials (if used by scripts)
# Not actively used by the current refactored scripts unless they are modified to read from here
VOLUME /credentials

# Expose port 8080 for the application
EXPOSE 8080

# Start the built-in PHP server
# -S 0.0.0.0:8080 : Listen on all interfaces on port 8080
# -t public : Set the document root to the /app/public directory
# public/index.php : The front controller for the Slim application
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public", "public/index.php"]
