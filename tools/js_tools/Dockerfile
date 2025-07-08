# Use Node.js 18 Alpine as base image for lightweight runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install production dependencies only for minimal image size
RUN npm install --production

# Copy all source files to the container
COPY . .

# Expose port 3000 (default bot webhook port)
EXPOSE 3000

# Set the entrypoint to run bot.js as the main application
ENTRYPOINT ["node", "bot.js"]
