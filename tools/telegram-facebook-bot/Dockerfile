# Use the official Python image with a slim variant
FROM python:3.9-slim # Use slim variant for minimal footprint

# Install system dependencies and Firefox for web automation
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    firefox-esr \
    fonts-liberation \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install GeckoDriver for Firefox automation
# Download latest GeckoDriver, extract to /usr/local/bin, and cleanup
RUN wget -q https://github.com/mozilla/geckodriver/releases/download/v0.33.0/geckodriver-v0.33.0-linux64.tar.gz -O /tmp/geckodriver.tar.gz && \
    tar -xzf /tmp/geckodriver.tar.gz -C /usr/local/bin && \
    chmod +x /usr/local/bin/geckodriver && \
    rm /tmp/geckodriver.tar.gz

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install Python dependencies without caching for smaller image size
RUN pip install --no-cache-dir -r requirements.txt

# Add a non-root user for security and switch to it
# --disabled-password: No password authentication
# --gecos '': Empty GECOS field
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Set the entry point to the Python script
ENTRYPOINT ["python", "main.py"]

# No exposed ports since there are no web-driven callbacks used.

# Documentation about the application for easy identification
LABEL Description="Telegram-Facebook-Bot that scrapes content from Facebook and posts to Telegram" \
      Version="1.0" \
      Maintainer="Your Name <youremail@example.com>"
