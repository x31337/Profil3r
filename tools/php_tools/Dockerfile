# Use the PHP 8.2 CLI base image on Alpine for slim PHP environment
FROM php:8.2-cli-alpine

# Set the working directory
WORKDIR /app

# Copy all scripts and server files into the container
COPY facebook_scripts/ /app/
COPY server.php /app/

# Ensure all PHP scripts are executable (if needed) for correct execution
RUN chmod +x /app/*.php

# Define an optional volume for storing sensitive credentials
VOLUME /credentials

# Expose port 80
EXPOSE 80

# Start the built-in PHP server
CMD ["php", "-S", "0.0.0.0:80", "server.php"]
