# Troubleshooting Guide

## Common Issues

### 1. Permission Denied Errors

**Symptoms**: Cannot write to logs, results, or config directories

**Solution**:

```bash
# Fix file permissions
sudo chown -R $USER:$USER ./logs ./results ./config

# For Docker
docker-compose down
sudo chown -R $USER:$USER ./logs ./results ./config
docker-compose up -d
```

### 2. Port Conflicts

**Symptoms**: "Port already in use" errors

**Solution**:

```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :4444

# Kill processes using the ports
sudo kill -9 $(lsof -t -i:3000)
sudo kill -9 $(lsof -t -i:8000)
sudo kill -9 $(lsof -t -i:4444)

# Or modify port mapping in build/docker-compose.yml
```

### 3. Out of Disk Space

**Symptoms**: Docker build failures, container crashes

**Solution**:

```bash
# Clean up Docker resources
docker system prune -af
docker volume prune -f

# Remove unused images
docker image prune -a

# Check disk usage
df -h
docker system df
```

### 4. Service Health Check Failures

**Symptoms**: Services show as unhealthy in `docker-compose ps`

**Solution**:

```bash
# Check service logs
docker-compose logs -f [service-name]

# Manual health check
curl -v http://localhost:8000/api/health
curl -v http://localhost:3000/api/health
curl -v http://localhost:4444/api/health

# Restart specific service
docker-compose restart [service-name]
```

### 5. Database Connection Issues

**Symptoms**: Database connection errors, migration failures

**Solution**:

```bash
# Check database container
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Manual database connection test
docker-compose exec postgres psql -U profil3r -d profil3r
```

### 6. Environment Variable Issues

**Symptoms**: Missing API keys, configuration errors

**Solution**:

```bash
# Check environment variables
docker-compose exec profil3r-core env | grep -E "(API|KEY|TOKEN)"

# Verify .env file exists and is properly formatted
cat .env

# Restart services after env changes
docker-compose down
docker-compose up -d
```

## Debugging Commands

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f profil3r-core

# Last 100 lines
docker-compose logs --tail=100 js-tools

# Follow logs with timestamps
docker-compose logs -f -t
```

### Container Inspection

```bash
# Enter container shell
docker-compose exec profil3r-core bash
docker-compose exec js-tools sh

# Run commands in container
docker-compose exec profil3r-core python profil3r.py --help

# Check container stats
docker stats

# Inspect container configuration
docker inspect profil3r-core
```

### Network Debugging

```bash
# Test network connectivity between containers
docker-compose exec profil3r-core ping js-tools
docker-compose exec js-tools ping osint

# Check exposed ports
docker-compose port js-tools 3000
docker-compose port osint 8000

# List networks
docker network ls
docker network inspect profil3r_default
```

## Performance Issues

### High CPU Usage

```bash
# Check container resource usage
docker stats

# Limit container resources in build/docker-compose.yml
services:
  profil3r-core:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Memory Issues

```bash
# Check memory usage
docker stats --no-stream

# Clear application caches
docker-compose exec profil3r-core python -c "import gc; gc.collect()"

# Restart services to clear memory
docker-compose restart
```

### Slow Response Times

```bash
# Check service response times
time curl http://localhost:8000/api/health
time curl http://localhost:3000/api/health

# Profile application performance
docker-compose exec profil3r-core python -m cProfile profil3r.py

# Check for resource bottlenecks
docker-compose top
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs**: Always start with `docker-compose logs -f`
2. **Search existing issues**: Check the project's GitHub issues
3. **Create a bug report**: Include logs, system info, and reproduction steps
4. **Use verbose mode**: Enable debug logging in `config/config.json`

```json
{
  "log_level": "DEBUG",
  "debug_mode": true
}
```
