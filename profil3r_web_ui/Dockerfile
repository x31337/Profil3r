# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the Profil3r core application files
# This assumes the Docker build context is the root of the repository.
# So, files are copied from 'profil3r' and 'profil3r_web_ui' into the image.
COPY ./profil3r /app/profil3r
COPY ./config/config.json /app/config/config.json
COPY ./dependencies/requirements.txt /app/dependencies/requirements.txt

# Copy the web UI application files
COPY ./profil3r_web_ui /app/profil3r_web_ui

# Install system dependencies that might be needed by some Profil3r dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    libxml2-dev \
    libxslt-dev \
    xclip \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for Profil3r
# Some dependencies in Profil3r's requirements might be for specific OS or have tricky deps.
# Order of installation might matter, or specific versions might be needed.
RUN pip install --no-cache-dir -r /app/dependencies/requirements.txt

# Install Flask (specific to the web UI)
RUN pip install --no-cache-dir Flask==2.1.2 Jinja2==3.1.2 Werkzeug==2.1.2 itsdangerous==2.1.2 click==8.1.3 MarkupSafe==2.1.1

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Define environment variable for Flask app (optional, can be set in app.py too)
ENV FLASK_APP=profil3r_web_ui/app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5001
# ENV FLASK_DEBUG=1 # Set to 0 or remove for production

# Change working directory to where app.py is, to simplify CMD
WORKDIR /app/profil3r_web_ui

# Run app.py when the container launches
# Using `flask run` is good for development.
# For production, a proper WSGI server like Gunicorn would be recommended.
# CMD ["flask", "run"]
# For this task, directly running the script is fine as it includes app.run()
CMD ["python", "app.py"]
