# Multi-stage Dockerfile for Ruby Reporter
# Stage 1: Build dependencies
FROM ruby:3.2-alpine as builder

# Set environment variables for Bundler
# - BUNDLE_PATH: Location to install gems
# - BUNDLE_WITHOUT: Exclude development and test groups
# - BUNDLE_SILENCE_ROOT_WARNING: Suppress root warning for Bundler
ENV BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT=development:test \
    BUNDLE_SILENCE_ROOT_WARNING=1

# Install system dependencies for building Ruby gems
# - build-base: Essential build tools (gcc, make, etc.)
# - git: For installing gems from git repositories
# - curl: For HTTP requests
# - ca-certificates: For SSL/TLS connections
# - libxml2-dev, libxslt-dev, zlib-dev: Development headers
RUN apk add --no-cache \
    build-base \
    git \
    curl \
    ca-certificates \
    libxml2-dev \
    libxslt-dev \
    zlib-dev

# Create app directory
WORKDIR /app

# Create a Gemfile for the Ruby reporter dependencies
RUN echo "source 'https://rubygems.org'" > Gemfile && \
    echo "gem 'mechanize', '~> 2.8'" >> Gemfile && \
    echo "gem 'colorize', '~> 0.8'" >> Gemfile && \
    echo "gem 'highline', '~> 2.0'" >> Gemfile && \
    echo "gem 'optparse', '~> 0.1'" >> Gemfile

# Install Ruby dependencies
RUN bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

# Stage 2: Production image
FROM ruby:3.2-alpine as production

# Set environment variables
ENV BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT=development:test \
    BUNDLE_SILENCE_ROOT_WARNING=1

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    libxml2 \
    libxslt \
    zlib

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S rubyuser && \
    adduser -S rubyuser -u 1001 -G rubyuser

# Copy gems from builder
COPY --from=builder /usr/local/bundle /usr/local/bundle

# Copy application files
COPY scripts/legacy/ ./scripts/legacy/
COPY config*.json ./

# Create directories for logs and results
RUN mkdir -p /app/logs /app/results && \
    chown -R rubyuser:rubyuser /app

# Switch to non-root user
USER rubyuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ruby --version || exit 1

# Default command
CMD ["ruby", "scripts/legacy/ruby_tool_faceports_reporter_run.rb", "--help"]
