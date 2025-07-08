# syntax=docker/dockerfile:1
# Base stage
FROM php:8.2-apache AS base

# Dependencies stage
FROM base AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Production image
FROM base AS production
WORKDIR /var/www/html

# Enable Apache rewrite module
RUN a2enmod rewrite

COPY --from=dependencies /app/vendor ./vendor
COPY . .
RUN chown -R www-data:www-data /var/www/html
EXPOSE 80
