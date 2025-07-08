# Multi-stage Dockerfile for JS Tools
# Stage 1: Build dependencies
FROM node:18-alpine as builder

# Set environment variables
ENV NODE_ENV=production \
    NPM_CONFIG_CACHE=/tmp/.npm

# Install system dependencies for building
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Create app directory
WORKDIR /app

# Copy package.json files from different tools
COPY js_tools/messenger_bot_framework/fbbot/package*.json ./fbbot/
COPY js_tools/facebook_mass_messenger/package*.json ./facebook_mass_messenger/

# Install dependencies for fbbot
WORKDIR /app/fbbot
RUN npm ci --only=production && npm cache clean --force

# Install dependencies for facebook_mass_messenger
WORKDIR /app/facebook_mass_messenger
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production image
FROM node:18-alpine as production

# Set environment variables
ENV NODE_ENV=production \
    USER=nodejs

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    dumb-init

# Create app directory
WORKDIR /app

# Create non-root user (nodejs already exists in alpine)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built node_modules from builder
COPY --from=builder /app/fbbot/node_modules ./js_tools/messenger_bot_framework/fbbot/node_modules/
COPY --from=builder /app/facebook_mass_messenger/node_modules ./js_tools/facebook_mass_messenger/node_modules/

# Copy application files
COPY js_tools/ ./js_tools/
COPY config*.json ./

# Create directories for logs and results
RUN mkdir -p /app/logs /app/results && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port for services
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('OK')" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["node", "js_tools/messenger_bot_framework/fbbot/index.js"]
