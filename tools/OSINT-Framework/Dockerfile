FROM node:18-alpine

# Set working directory for application code
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for postinstall)
RUN npm ci

# Remove devDependencies after postinstall to clean up image
RUN npm prune --production

# Copy remaining code
COPY . .

# Expose port 8000
EXPOSE 8000

# Set entry point
ENTRYPOINT ["node", "health-server.js"]
