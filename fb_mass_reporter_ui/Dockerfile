# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV FLASK_APP app.py
ENV FLASK_RUN_HOST 0.0.0.0
ENV FLASK_RUN_PORT 5001
ENV DISPLAY :99

# Install system dependencies for Chrome and Xvfb
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    wget \
    # Install Chrome
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    # Install Xvfb for headless browser operation
    && apt-get install -y xvfb \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Flask application code into the container at /app
COPY . .

# Copy the shared 'modules' directory from the project root into the container
# This assumes the Docker build context is the project root, or this path needs adjustment.
# If build context is `fb_mass_reporter_ui`, then this needs to be `../modules`
# For now, assuming context is `fb_mass_reporter_ui` directory itself.
# The app.py adjusts sys.path, so placing 'modules' adjacent to 'app' in container works.
COPY ../modules ./modules

# Create a non-root user and switch to it (optional, for security)
# RUN useradd --create-home appuser
# USER appuser

# Create uploads directory and set permissions if running as non-root
RUN mkdir -p uploads && chown -R $(whoami) uploads
# If using appuser: RUN mkdir -p uploads && chown -R appuser:appuser uploads

# Expose the port the app runs on
EXPOSE 5001

# Define the entrypoint script
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Run the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

# Default command for the entrypoint script (Flask run)
CMD ["flask", "run"]
