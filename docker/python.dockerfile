# Multi-stage Dockerfile for Profil3r Core + Modules
# Stage 1: Build dependencies
FROM python:3.11-slim as builder

# Set environment variables for Python
# - PYTHONDONTWRITEBYTECODE: Prevent creation of .pyc files
# - PYTHONUNBUFFERED: Prevent buffering of stdout and stderr
# - PIP_NO_CACHE_DIR: Disable pip cache
# - PIP_DISABLE_PIP_VERSION_CHECK: Prevent pip from checking for updates
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for building Python packages
# - gcc, g++, make: Compilers for native extensions
# - libxml2-dev, libxslt-dev: XML processing libraries
# - zlib1g-dev: Compression library
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libxml2-dev \
    libxslt-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment for dependency isolation
RUN python -m venv /opt/venv
# Add virtual environment to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

# Stage 2: Production image
FROM python:3.11-slim as production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Install runtime dependencies
# - curl: For HTTP requests and health checks
# - ca-certificates: For SSL/TLS connections
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Create app directory
WORKDIR /app

# Create non-root user for security
# - groupadd: Create profil3r group
# - useradd: Create profil3r user in the group
RUN groupadd -r profil3r && useradd -r -g profil3r profil3r

# Copy application files
COPY profil3r/ ./profil3r/
COPY modules/ ./modules/
COPY *.py ./
COPY config*.json ./

# Create directories for logs and results
RUN mkdir -p /app/logs /app/results && \
    chown -R profil3r:profil3r /app

# Switch to non-root user
USER profil3r

# Expose port for any web services
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import profil3r.core; print('OK')" || exit 1

# Default command
CMD ["python", "profil3r.py"]
