# syntax=docker/dockerfile:1
# Main Dockerfile for the core service

# Use Node.js as the base since this appears to be a Node.js project
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm install --only=production --ignore-scripts

# Production stage
FROM base AS production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Expose port
EXPOSE 8000

# Default command
CMD ["node", "core-server.js"]
