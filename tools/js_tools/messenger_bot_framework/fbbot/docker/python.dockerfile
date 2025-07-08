# syntax=docker/dockerfile:1
# Base stage
FROM python:3.9-slim AS base

# Dependencies stage
FROM base AS dependencies
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Production image
FROM base AS production
WORKDIR /app
COPY --from=dependencies /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY . .
