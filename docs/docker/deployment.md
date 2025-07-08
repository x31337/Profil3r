# Docker Deployment Guide

## Quick Start

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Service Management

### Build Commands

```bash
# Build specific service
docker-compose build profil3r-core
docker-compose build js-tools
docker-compose build php-tools
docker-compose build ruby-reporter

# Build with no cache
docker-compose build --no-cache

# Build and start services
docker-compose up --build
```

### Run Commands

```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up profil3r-core js-tools

# Start with profiles (optional services)
docker-compose --profile cache up        # Include Redis
docker-compose --profile database up     # Include PostgreSQL
docker-compose --profile proxy up        # Include Nginx

# Start all services including optional ones
docker-compose --profile cache --profile database --profile proxy up
```

## Port Mappings

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| profil3r-core | 8000 | - | Main application (no external access) |
| js-tools | 3000 | 3000 | JavaScript tools web interface |
| php-tools | 80 | - | PHP scripts (no external access) |
| ruby-reporter | - | - | Ruby reporter (no web interface) |
| redis | 6379 | 6379 | Redis cache (optional) |
| postgres | 5432 | 5432 | PostgreSQL database (optional) |
| nginx | 80/443 | 80/443 | Reverse proxy (optional) |

## Volume Management

### Persistent Data Volumes

- `profil3r-data`: Shared application data
- `redis-data`: Redis persistence
- `postgres-data`: PostgreSQL data

### Host Bind Mounts

| Host Path | Container Path | Description |
|-----------|----------------|-------------|
| `./logs` | `/app/logs` | Application logs |
| `./results` | `/app/results` | Output results |
| `./config` | `/app/config` | Configuration files |
| `./nginx.conf` | `/etc/nginx/nginx.conf` | Nginx configuration |
| `./ssl` | `/etc/nginx/ssl` | SSL certificates |
| `./schema` | `/docker-entrypoint-initdb.d` | Database schema |

## Health Checks

All services include health checks:

```bash
# Check service status
docker-compose ps

# View health check logs
docker inspect profil3r-core --format='{{json .State.Health}}'

# Manual health check
docker-compose exec profil3r-core python -c "import profil3r.core; print('OK')"
```

## Update Procedures

### Standard Update

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose build
docker-compose up -d

# View logs to verify
docker-compose logs -f
```

### Clean Update (removes old images)

```bash
# Stop services
docker-compose down

# Remove old images
docker-compose build --no-cache
docker system prune -f

# Start services
docker-compose up -d
```

### Database Migration

```bash
# Backup database (if using PostgreSQL)
docker-compose exec postgres pg_dump -U profil3r profil3r > backup.sql

# Stop services
docker-compose down

# Update and restart
git pull origin main
docker-compose build
docker-compose up -d
```
