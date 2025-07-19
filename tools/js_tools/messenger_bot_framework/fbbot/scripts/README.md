# Development Scripts

This directory contains scripts to help with local development setup and workflows.

## Bootstrap Script

The `bootstrap.sh` script sets up your complete local development environment with all services,
file watching, and health checks.

### Usage

```bash
./scripts/bootstrap.sh
```

### What it does

1. **Version Verification**: Checks that Docker, Node.js, and Python are installed with compatible
   versions
2. **Container Management**: Stops any existing containers and starts fresh development containers
3. **Service Building**: Runs `make build` inside each service container (if build/Makefile exists)
4. **Development Tools**: Installs file watching tools (nodemon, watchdog, rerun) in containers
5. **File Watching Setup**: Creates `docker-compose.watch.yml` for live reload functionality
6. **Health Checks**: Verifies all services are running and responding on their ports
7. **Next Steps**: Provides helpful commands and service URLs

### Features

- ✅ **Version Checking**: Ensures Docker 20.10+, Node.js 16+, and Python 3.8+ are installed
- ✅ **Error Handling**: Graceful error handling with informative messages
- ✅ **Colored Output**: Color-coded logging for better visibility
- ✅ **Service Health**: Automated health checks for all services
- ✅ **File Watching**: Automatic code reloading for development

### Services Started

The script starts the following services:

| Service      | Port | URL                   | Description          |
| ------------ | ---- | --------------------- | -------------------- |
| Python Flask | 5000 | http://localhost:5000 | Python/Flask backend |
| Node.js      | 3000 | http://localhost:3000 | Node.js application  |
| PHP          | 80   | http://localhost:80   | PHP application      |
| Ruby         | 4567 | http://localhost:4567 | Ruby application     |
| Core         | 8000 | http://localhost:8000 | Core service         |

### File Watching

The script creates a `docker-compose.watch.yml` file that enables live code reloading:

```bash
# Enable file watching
docker compose -f docker-compose.dev.yml -f docker-compose.watch.yml watch
```

File watching features:

- **Python**: Uses `watchdog` and `watchmedo` for Python file changes
- **Node.js**: Uses `nodemon` for JavaScript file changes
- **Ruby**: Uses `rerun` for Ruby file changes
- **PHP**: Built-in file watching through volume mounts
- **Auto-restart**: Restarts services when dependency files change

### Useful Commands

After running the bootstrap script, you can use these commands:

```bash
# View logs for all services
docker compose -f docker-compose.dev.yml logs -f

# View logs for a specific service
docker compose -f docker-compose.dev.yml logs -f profil3r-python

# Restart a service
docker compose -f docker-compose.dev.yml restart profil3r-node

# Stop all services
docker compose -f docker-compose.dev.yml down

# Rebuild a service
docker compose -f docker-compose.dev.yml up --build profil3r-python

# Enable file watching
docker compose -f docker-compose.dev.yml -f docker-compose.watch.yml watch
```

### Requirements

- Docker Desktop or Docker Engine 20.10+
- Docker Compose (v2 recommended)
- Node.js 16+
- Python 3.8+
- curl (for health checks)

### Troubleshooting

If you encounter issues:

1. **Port conflicts**: Make sure ports 80, 3000, 4567, 5000, and 8000 are available
2. **Docker not running**: Start Docker Desktop or Docker daemon
3. **Permission issues**: Ensure the script is executable (`chmod +x scripts/bootstrap.sh`)
4. **Service not starting**: Check individual service logs with `docker compose logs [service]`

### Development Workflow

1. Run the bootstrap script to set up your environment
2. Enable file watching for live reloading
3. Start coding - changes will automatically reload services
4. Use the provided URLs to test your applications
5. Monitor logs for debugging

The bootstrap script is designed to be idempotent - you can run it multiple times safely.
