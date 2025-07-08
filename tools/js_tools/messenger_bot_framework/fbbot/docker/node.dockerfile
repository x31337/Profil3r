# syntax=docker/dockerfile:1
# Base stage
FROM node:18-alpine AS base

# Dependencies stage
FROM base AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --only=production --ignore-scripts

# Production image
FROM base AS production
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
