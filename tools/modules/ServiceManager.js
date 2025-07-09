const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ServiceManager {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.services = {};
    this.healthCheckInterval = null;
  }

  async startService(service) {
    if (this.services[service.name]) {
      console.log(`⚠️ Service ${service.name} is already running`);
      return;
    }

    console.log(`🚀 Starting service: ${service.name}`);

    this.eventBus.broadcast('service-starting', { service: service.name });

    try {
      const servicePath = path.join(this.config.projectRoot, service.dir);

      if (!fs.existsSync(servicePath)) {
        throw new Error(`Service directory not found: ${servicePath}`);
      }

      let child;

      switch (service.type) {
        case 'node':
          child = spawn('npm', ['start'], {
            cwd: servicePath,
            stdio: 'inherit',
            detached: true
          });
          break;
        case 'python':
          child = spawn('python3', ['app.py'], {
            cwd: servicePath,
            stdio: 'inherit',
            detached: true
          });
          break;
        case 'php':
          child = spawn(
            'php',
            ['-S', `localhost:${service.port}`, 'index.php'],
            {
              cwd: servicePath,
              stdio: 'inherit',
              detached: true
            }
          );
          break;
        default:
          throw new Error(`Unsupported service type: ${service.type}`);
      }

      this.services[service.name] = {
        process: child,
        service: service,
        status: 'starting',
        startTime: new Date().toISOString()
      };

      // Wait for service to be ready
      if (service.port) {
        await this.waitForService(service);
      }

      this.services[service.name].status = 'running';

      this.eventBus.broadcast('service-started', {
        service: service.name,
        port: service.port,
        status: 'running'
      });

      console.log(`✅ Service ${service.name} started successfully`);
    } catch (error) {
      console.error(
        `❌ Failed to start service ${service.name}:`,
        error.message
      );

      this.eventBus.broadcast('service-start-failed', {
        service: service.name,
        error: error.message
      });

      throw error;
    }
  }

  async stopService(serviceName) {
    if (!this.services[serviceName]) {
      console.log(`⚠️ Service ${serviceName} is not running`);
      return;
    }

    console.log(`🛑 Stopping service: ${serviceName}`);

    this.eventBus.broadcast('service-stopping', { service: serviceName });

    try {
      const serviceInfo = this.services[serviceName];

      if (serviceInfo.process && !serviceInfo.process.killed) {
        serviceInfo.process.kill('SIGTERM');

        // Wait for graceful shutdown
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            if (!serviceInfo.process.killed) {
              serviceInfo.process.kill('SIGKILL');
            }
            resolve();
          }, 5000);

          serviceInfo.process.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }

      delete this.services[serviceName];

      this.eventBus.broadcast('service-stopped', {
        service: serviceName,
        status: 'stopped'
      });

      console.log(`✅ Service ${serviceName} stopped successfully`);
    } catch (error) {
      console.error(`❌ Failed to stop service ${serviceName}:`, error.message);

      this.eventBus.broadcast('service-stop-failed', {
        service: serviceName,
        error: error.message
      });

      throw error;
    }
  }

  async restartService(serviceName) {
    console.log(`🔄 Restarting service: ${serviceName}`);

    this.eventBus.broadcast('service-restarting', { service: serviceName });

    try {
      const serviceInfo = this.services[serviceName];

      if (serviceInfo) {
        await this.stopService(serviceName);
        await this.startService(serviceInfo.service);
      } else {
        // Find service in config and start it
        const service = this.config.services.find(s => s.name === serviceName);
        if (service) {
          await this.startService(service);
        } else {
          throw new Error(`Service ${serviceName} not found in configuration`);
        }
      }

      this.eventBus.broadcast('service-restarted', {
        service: serviceName,
        status: 'running'
      });

      console.log(`✅ Service ${serviceName} restarted successfully`);
    } catch (error) {
      console.error(
        `❌ Failed to restart service ${serviceName}:`,
        error.message
      );

      this.eventBus.broadcast('service-restart-failed', {
        service: serviceName,
        error: error.message
      });

      throw error;
    }
  }

  async startAllServices() {
    console.log('🚀 Starting all services...');

    const startPromises = this.config.services.map(async service => {
      if (service.port) {
        try {
          await this.startService(service);
        } catch (error) {
          console.error(`Failed to start ${service.name}:`, error.message);
        }
      }
    });

    await Promise.all(startPromises);

    this.eventBus.broadcast('all-services-started', {
      services: Object.keys(this.services)
    });
  }

  async stopAllServices() {
    console.log('🛑 Stopping all services...');

    const stopPromises = Object.keys(this.services).map(async serviceName => {
      try {
        await this.stopService(serviceName);
      } catch (error) {
        console.error(`Failed to stop ${serviceName}:`, error.message);
      }
    });

    await Promise.all(stopPromises);

    this.eventBus.broadcast('all-services-stopped', {
      services: []
    });
  }

  async waitForService(service, timeout = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await axios.get(`http://localhost:${service.port}`, {
          timeout: 1000
        });

        if (response.status === 200) {
          console.log(`✅ ${service.name} is ready on port ${service.port}`);
          return;
        }
      } catch (error) {
        // Service not ready yet, wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Service ${service.name} failed to start within timeout`);
  }

  async performHealthCheck(service) {
    try {
      const response = await axios.get(
        `http://localhost:${service.port}/health`,
        { timeout: 5000 }
      );

      return {
        service: service.name,
        status: 'healthy',
        response: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: service.name,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async performAllHealthChecks() {
    console.log('🔍 Performing health checks...');

    const healthChecks = {};

    for (const serviceName of Object.keys(this.services)) {
      const serviceInfo = this.services[serviceName];

      if (serviceInfo.service.port) {
        const healthCheck = await this.performHealthCheck(serviceInfo.service);
        healthChecks[serviceName] = healthCheck;
      }
    }

    this.eventBus.broadcast('health-checks-completed', {
      healthChecks
    });

    return healthChecks;
  }

  startHealthMonitoring(interval = 30000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      const healthChecks = await this.performAllHealthChecks();

      // Check for unhealthy services and attempt restart
      for (const [serviceName, health] of Object.entries(healthChecks)) {
        if (health.status === 'unhealthy') {
          console.log(
            `⚠️ Service ${serviceName} is unhealthy, attempting restart...`
          );
          try {
            await this.restartService(serviceName);
          } catch (error) {
            console.error(
              `Failed to restart unhealthy service ${serviceName}:`,
              error.message
            );
          }
        }
      }
    }, interval);

    console.log(`🔍 Health monitoring started (interval: ${interval}ms)`);
  }

  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🔍 Health monitoring stopped');
    }
  }

  getServiceStatus(serviceName) {
    return this.services[serviceName] || null;
  }

  getAllServiceStatuses() {
    return Object.keys(this.services).map(name => ({
      name,
      ...this.services[name]
    }));
  }

  isServiceRunning(serviceName) {
    return (
      this.services[serviceName] &&
      this.services[serviceName].status === 'running'
    );
  }
}

module.exports = ServiceManager;
