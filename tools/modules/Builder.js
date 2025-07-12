const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const axios = require('axios');
const { findFiles } = require('./utils');

class Builder {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.buildQueue = [];
    this.building = false;
    this.buildProcesses = {};
  }

  async fullBuild() {
    if (this.building) {
      console.log('⏳ Build already in progress...');
      return;
    }

    this.building = true;
    const buildId = Date.now();

    this.eventBus.broadcast('build-started', { buildId });

    try {
      console.log('🔨 Starting full build...');

      await this.buildAllComponents();

      this.eventBus.broadcast('build-completed', { buildId, success: true });
      console.log('✅ Full build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      this.eventBus.broadcast('build-failed', {
        buildId,
        error: error.message
      });
      throw error;
    } finally {
      this.building = false;
    }
  }

  async incrementalBuild(changedFiles) {
    console.log(`🔄 Incremental build for ${changedFiles.length} files...`);

    const affectedServices = new Set();

    for (const file of changedFiles) {
      for (const service of this.config.services) {
        if (file.startsWith(service.dir)) {
          affectedServices.add(service);
        }
      }
    }

    for (const service of affectedServices) {
      try {
        await this.buildComponent(service);
      } catch (error) {
        console.error(
          `❌ Incremental build failed for ${service.name}:`,
          error.message
        );
        this.eventBus.broadcast('incremental-build-failed', {
          service: service.name,
          error: error.message
        });
      }
    }

    this.eventBus.broadcast('incremental-build-completed', {
      changedFiles,
      affectedServices: Array.from(affectedServices).map(s => s.name)
    });
  }

  async buildAllComponents() {
    console.log('🏗️ Building all components...');

    const buildPromises = this.config.services.map(async service => {
      try {
        await this.buildComponent(service);
        this.eventBus.broadcast('component-built', {
          service: service.name,
          status: 'success'
        });
      } catch (error) {
        this.eventBus.broadcast('component-build-failed', {
          service: service.name,
          error: error.message
        });
        throw error;
      }
    });

    await Promise.all(buildPromises);
  }

  async buildComponent(service) {
    const servicePath = path.join(this.config.projectRoot, service.dir);

    if (!fs.existsSync(servicePath)) {
      throw new Error(`Service directory not found: ${servicePath}`);
    }

    switch (service.type) {
      case 'node':
        await this.buildNodeService(service, servicePath);
        break;
      case 'python':
        await this.buildPythonService(service, servicePath);
        break;
      case 'php':
        await this.buildPHPService(service, servicePath);
        break;
    }
  }

  async buildNodeService(service, servicePath) {
    console.log(`🔨 Building ${service.name}...`);

    if (fs.existsSync(path.join(servicePath, 'package.json'))) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(servicePath, 'package.json'), 'utf8')
      );

      execSync('npm install', { cwd: servicePath, stdio: 'inherit' });

      if (packageJson.scripts && packageJson.scripts.build) {
        execSync('npm run build', { cwd: servicePath, stdio: 'inherit' });
      }
    }
  }

  async buildPythonService(service, servicePath) {
    console.log(`🐍 Building ${service.name}...`);

    const pyFiles = findFiles(servicePath, '*.py');
    for (const file of pyFiles) {
      try {
        execSync(`python3 -m py_compile "${file}"`, { stdio: 'inherit' });
      } catch (error) {
        throw new Error(`Python syntax error in ${file}: ${error.message}`);
      }
    }

    const requirementsPath = path.join(servicePath, 'dependencies/requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      execSync(`pip3 install -r "${requirementsPath}"`, { stdio: 'inherit' });
    }
  }

  async buildPHPService(service, servicePath) {
    console.log(`🐘 Building ${service.name}...`);

    const phpFiles = findFiles(servicePath, '*.php');
    for (const file of phpFiles) {
      try {
        execSync(`php -l "${file}"`, { stdio: 'inherit' });
      } catch (error) {
        throw new Error(`PHP syntax error in ${file}: ${error.message}`);
      }
    }
  }

  queueBuild(triggerFile) {
    if (this.buildQueue.length === 0) {
      this.buildQueue.push(triggerFile);

      setTimeout(async () => {
        if (this.buildQueue.length > 0) {
          const files = [...this.buildQueue];
          this.buildQueue = [];
          await this.incrementalBuild(files);
        }
      }, 2000);
    } else {
      this.buildQueue.push(triggerFile);
    }
  }

  stopAllBuilds() {
    Object.values(this.buildProcesses).forEach(process => {
      if (process && !process.killed) {
        process.kill();
      }
    });
    this.buildProcesses = {};
  }
}

module.exports = Builder;
