#!/usr/bin/env node

/**
 * Profil3r Auto Build System - Legacy Interface
 * Thin wrapper maintaining backward compatibility while proxying to new modules
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const express = require('express');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const axios = require('axios');
const git = require('simple-git');

// Import new modules
const {
  ServiceManager,
  EventBus,
  Builder,
  Deployer,
  Tester,
  AutoFixEngine,
  DependencyManager
} = require('./modules');

class AutoBuildSystem {
  constructor() {
    this.config = {
      projectRoot: process.cwd(),
      buildDir: path.join(process.cwd(), 'build'),
      logDir: path.join(process.cwd(), 'logs'),
      webPort: 9000,
      wsPort: 9001,
      services: [
        {
          name: 'OSINT Framework',
          dir: 'OSINT-Framework',
          port: 8000,
          type: 'node'
        },
        {
          name: 'Facebook Mass Messenger',
          dir: 'js_tools/facebook_mass_messenger',
          port: 4444,
          type: 'node'
        },
        {
          name: 'Messenger Bot Framework',
          dir: 'js_tools/messenger_bot_framework/fbbot',
          port: 3000,
          type: 'node'
        },
        {
          name: 'Python Tools',
          dir: 'telegram-facebook-bot',
          port: null,
          type: 'python'
        },
        { name: 'PHP Tools', dir: 'php_tools', port: null, type: 'php' }
      ],
      autoFix: true,
      autoPush: true,
      realTimeMonitoring: true,
      testCoverage: 100,
      buildTimeout: 300000 // 5 minutes
    };

    this.state = {
      building: false,
      testing: false,
      services: {},
      buildQueue: [],
      testResults: {},
      healthChecks: {},
      errors: [],
      lastBuild: null,
      buildCount: 0,
      testCount: 0,
      deployCount: 0
    };

    this.git = git();
    this.watchers = [];
    this.buildProcesses = {}; // Maintained for backward compatibility
    this.testProcesses = {}; // Maintained for backward compatibility

    // Initialize new modules
    this.eventBus = new EventBus();
    this.dependencyManager = new DependencyManager(this.config);
    this.builder = new Builder(this.config, this.eventBus);
    this.tester = new Tester(this.config, this.eventBus);
    this.deployer = new Deployer(this.config, this.eventBus, this.git);
    this.autoFixEngine = new AutoFixEngine(this.config, this.eventBus);
    this.serviceManager = new ServiceManager(this.config, this.eventBus);

    // Set up event listeners for legacy state management
    this.setupEventListeners();

    this.init();
  }

  setupEventListeners() {
    // Update legacy state from new module events
    this.eventBus.on('build-started', (data) => {
      this.state.building = true;
      this.state.buildCount++;
      this.state.lastBuild = new Date().toISOString();
      this.broadcast('build-started', data);
    });

    this.eventBus.on('build-completed', (data) => {
      this.state.building = false;
      this.broadcast('build-completed', data);
    });

    this.eventBus.on('build-failed', (data) => {
      this.state.building = false;
      this.state.errors.push({
        type: 'build',
        message: data.error,
        timestamp: new Date().toISOString()
      });
      this.broadcast('build-failed', data);
    });

    this.eventBus.on('tests-started', (data) => {
      this.state.testing = true;
      this.state.testCount++;
      this.broadcast('tests-started', data);
    });

    this.eventBus.on('tests-completed', (data) => {
      this.state.testing = false;
      this.state.testResults = data.results;
      this.broadcast('tests-completed', data);
    });

    this.eventBus.on('tests-failed', (data) => {
      this.state.testing = false;
      this.state.errors.push({
        type: 'test',
        message: data.error,
        timestamp: new Date().toISOString()
      });
      this.broadcast('tests-failed', data);
    });

    this.eventBus.on('deployment-completed', (data) => {
      this.state.deployCount++;
      this.broadcast('deployment-completed', data);
    });

    this.eventBus.on('deployment-failed', (data) => {
      this.state.errors.push({
        type: 'deployment',
        message: data.error,
        timestamp: new Date().toISOString()
      });
      this.broadcast('deployment-failed', data);
    });

    this.eventBus.on('health-checks-completed', (data) => {
      this.state.healthChecks = data.healthChecks;
      this.broadcast('health-update', data);
    });

    this.eventBus.on('component-built', (data) => {
      this.state.services[data.service] = {
        status: 'built',
        timestamp: new Date().toISOString()
      };
    });

    this.eventBus.on('component-build-failed', (data) => {
      this.state.services[data.service] = {
        status: 'failed',
        error: data.error,
        timestamp: new Date().toISOString()
      };
    });
  }

  async init() {
    console.log('🚀 Initializing Auto Build System...');

    // Create necessary directories
    this.createDirectories();

    // Start web server and WebSocket
    await this.startWebServer();
    await this.startWebSocketServer();

    // Initialize file watchers
    if (this.config.realTimeMonitoring) {
      this.initFileWatchers();
    }

    // Initial build and test
    await this.fullBuildCycle();

    // Start health monitoring
    this.startHealthMonitoring();

    console.log('✅ Auto Build System initialized successfully!');
    console.log(`🌐 Web Dashboard: http://localhost:${this.config.webPort}`);
    console.log(`📡 WebSocket: ws://localhost:${this.config.wsPort}`);
  }

  createDirectories() {
    const dirs = [this.config.buildDir, this.config.logDir];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async startWebServer() {
    // Legacy wrapper - delegate to main auto-build-system
    console.log('⚠️  Legacy WebServer wrapper - consider migrating to auto-build-system.js');
    
    const app = express();
    app.use(express.static(path.join(__dirname, 'web-ui')));
    app.use(express.json());

    // Simple proxy to delegate all API calls to high-level methods
    const apiRoutes = [
      { method: 'get', path: '/api/status', handler: () => ({ ...this.state, config: this.config, timestamp: new Date().toISOString() }) },
      { method: 'post', path: '/api/build', handler: () => this.fullBuildCycle() },
      { method: 'post', path: '/api/test', handler: () => this.runAllTests() },
      { method: 'post', path: '/api/deploy', handler: () => this.deployChanges() },
      { method: 'post', path: '/api/fix', handler: () => this.autoFixIssues() },
      { method: 'post', path: '/api/cypress', handler: () => this.runCypressTests() },
      { method: 'post', path: '/api/full-cycle', handler: () => this.runFullAutoCycle() },
      { method: 'post', path: '/api/auto-install', handler: () => this.autoInstallDependencies() },
      { method: 'post', path: '/api/auto-configure', handler: () => this.autoConfigureProject() },
      { method: 'post', path: '/api/auto-push', handler: () => this.autoPushChanges() },
    ];

    // Register routes with delegation
    apiRoutes.forEach(route => {
      app[route.method](route.path, async (req, res) => {
        try {
          const result = await route.handler();
          res.json({ success: true, result });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });
    });

    app.get('/api/logs/:type', (req, res) => {
      const { type } = req.params;
      const logFile = path.join(this.config.logDir, `${type}.log`);

      if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8').split('\n').slice(-100);
        res.json({ logs });
      } else {
        res.json({ logs: [] });
      }
    });

    app.listen(this.config.webPort, () => {
      console.log(`🌐 Web server running on port ${this.config.webPort}`);
    });
  }

  async startWebSocketServer() {
    console.log('⚠️  Legacy WebSocket wrapper - consider migrating to auto-build-system.js');
    
    this.wss = new WebSocket.Server({ port: this.config.wsPort });

    this.wss.on('connection', ws => {
      console.log('📡 WebSocket client connected');

      // Send current state
      ws.send(
        JSON.stringify({
          type: 'state',
          data: this.state
        })
      );

      ws.on('message', async message => {
        const { type, data } = JSON.parse(message);

        try {
          // All commands delegate to high-level methods
          const commandMap = {
            'build': () => this.fullBuildCycle(),
            'test': () => this.runAllTests(),
            'deploy': () => this.deployChanges(),
            'fix': () => this.autoFixIssues(),
            'auto-install': () => this.autoInstallDependencies(),
            'auto-configure': () => this.autoConfigureProject(),
            'auto-push': () => this.autoPushChanges(),
            'cypress': () => this.runCypressTests(),
            'full-cycle': () => this.runFullAutoCycle()
          };

          const handler = commandMap[type];
          if (handler) {
            await handler();
          } else {
            console.warn(`Unknown WebSocket command: ${type}`);
            this.broadcast('command-failed', { type, error: 'Unknown command' });
          }
        } catch (error) {
          console.error(`WebSocket command failed: ${error.message}`);
          this.broadcast('command-failed', { type, error: error.message });
        }
      });
    });

    console.log(`📡 WebSocket server running on port ${this.config.wsPort}`);
  }

  broadcast(type, data) {
    // Use EventBus for broadcasting (consistent with main system)
    this.eventBus.broadcastToWebSocket(this.wss, type, data);
  }

  initFileWatchers() {
    const watchPatterns = [
      '**/*.js',
      '**/*.py',
      '**/*.php',
      '**/*.json',
      '**/*.html',
      '**/*.css',
      '**/*.md',
      '**/*.yml',
      '**/*.yaml'
    ];

    const watcher = chokidar.watch(watchPatterns, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      cwd: this.config.projectRoot
    });

    watcher.on('change', async filePath => {
      console.log(`📝 File changed: ${filePath}`);
      this.broadcast('file-change', { path: filePath });

      // Auto-fix on change
      if (this.config.autoFix) {
        await this.autoFixFile(filePath);
      }

      // Queue build if not already building
      if (!this.state.building) {
        this.queueBuild(filePath);
      }
    });

    this.watchers.push(watcher);
  }

  async queueBuild(triggerFile) {
    // Proxy to builder
    this.builder.queueBuild(triggerFile);
  }

  // === LEGACY INTERFACE METHODS (THIN WRAPPERS) ===

  /**
   * Full build cycle - proxies to new modules sequentially
   */
  async fullBuildCycle() {
    if (this.state.building) {
      console.log('⏳ Build already in progress...');
      return;
    }

    try {
      console.log('🔨 Starting full build cycle...');

      // 1. Install dependencies → dependencyManager
      await this.installDependencies();

      // 2. Build all components → builder
      await this.buildAllComponents();

      // 3. Run all tests → tester
      await this.runAllTests();

      // 4. Deploy changes → deployer
      await this.deployChanges();

      // 5. Generate reports (kept here for now)
      await this.generateReports();

      console.log('✅ Full build cycle completed successfully!');
    } catch (error) {
      console.error('❌ Build cycle failed:', error.message);
      
      // Auto-fix on failure
      if (this.config.autoFix) {
        await this.autoFixIssues();
      }
      
      throw error;
    }
  }

  /**
   * Install dependencies - proxies to dependencyManager
   */
  async installDependencies() {
    return await this.dependencyManager.installDependencies();
  }

  /**
   * Build all components - proxies to builder
   */
  async buildAllComponents() {
    return await this.builder.fullBuild();
  }

  /**
   * Run all tests - proxies to tester
   */
  async runAllTests() {
    return await this.tester.runAllTests();
  }

  /**
   * Deploy changes - proxies to deployer
   */
  async deployChanges() {
    return await this.deployer.deployChanges();
  }

  /**
   * Auto-fix issues - proxies to autoFixEngine
   */
  async autoFixIssues() {
    return await this.autoFixEngine.autoFixIssues();
  }

  /**
   * Auto-fix file - proxies to autoFixEngine
   */
  async autoFixFile(filePath) {
    return await this.autoFixEngine.autoFixFile(filePath);
  }

  /**
   * Run Cypress tests - proxies to tester
   */
  async runCypressTests() {
    return await this.tester.runCypressTests();
  }

  /**
   * Service start/stop logic - proxies to serviceManager
   */
  async startService(service) {
    return await this.serviceManager.startService(service);
  }

  async stopService(serviceName) {
    return await this.serviceManager.stopService(serviceName);
  }

  async restartService(serviceName) {
    return await this.serviceManager.restartService(serviceName);
  }

  async startAllServices() {
    return await this.serviceManager.startAllServices();
  }

  async stopAllServices() {
    return await this.serviceManager.stopAllServices();
  }

  /**
   * Health monitoring - proxies to serviceManager
   */
  startHealthMonitoring() {
    return this.serviceManager.startHealthMonitoring();
  }

  stopHealthMonitoring() {
    return this.serviceManager.stopHealthMonitoring();
  }

  // === LEGACY METHODS MAINTAINED FOR BACKWARD COMPATIBILITY ===

  async lintAndFix() {
    // Proxy to autoFixEngine
    return await this.autoFixEngine.autoFixIssues();
  }

  async buildComponent(service) {
    // Proxy to builder
    return await this.builder.buildComponent(service);
  }

  async buildNodeService(service, servicePath) {
    // Proxy to builder
    return await this.builder.buildNodeService(service, servicePath);
  }

  async buildPythonService(service, servicePath) {
    // Proxy to builder
    return await this.builder.buildPythonService(service, servicePath);
  }

  async buildPHPService(service, servicePath) {
    // Proxy to builder
    return await this.builder.buildPHPService(service, servicePath);
  }

  async waitForService(service, timeout = 30000) {
    // Proxy to serviceManager
    return await this.serviceManager.waitForService(service, timeout);
  }

  async runUnitTests() {
    // Proxy to tester
    return await this.tester.runUnitTests();
  }

  async runIntegrationTests() {
    // Proxy to tester
    return await this.tester.runIntegrationTests();
  }

  async calculateCoverage() {
    // Proxy to tester
    return await this.tester.calculateCoverage();
  }

  async installDependenciesForPath(projectPath, name) {
    // Proxy to dependencyManager
    return await this.dependencyManager.installDependenciesForPath(projectPath, name);
  }

  async autoFixDependencies(projectPath, name) {
    // Proxy to dependencyManager
    return await this.dependencyManager.autoFixDependencies(projectPath, name);
  }

  async fixPackageJsonIssues() {
    // Proxy to autoFixEngine
    return await this.autoFixEngine.fixPackageJsonIssues();
  }

  async fixConfigurationIssues() {
    // Proxy to autoFixEngine
    return await this.autoFixEngine.fixConfigurationIssues();
  }

  async createDefaultConfig(filename) {
    // Proxy to autoFixEngine
    return await this.autoFixEngine.createDefaultConfig(filename);
  }

  async incrementalBuild(changedFiles) {
    // Proxy to builder
    return await this.builder.incrementalBuild(changedFiles);
  }

  async runQuickTests(affectedServices) {
    // Proxy to tester
    return await this.tester.runQuickTests(affectedServices);
  }

  findFiles(directory, pattern) {
    // Proxy to builder
    return this.builder.findFiles(directory, pattern);
  }

  // === REPORT GENERATION (KEPT HERE OR EXTRACT TO SEPARATE MODULE) ===

  async generateReports() {
    console.log('📊 Generating reports...');

    const report = {
      timestamp: new Date().toISOString(),
      buildCount: this.state.buildCount,
      testCount: this.state.testCount,
      deployCount: this.state.deployCount,
      services: this.state.services,
      testResults: this.state.testResults,
      healthChecks: this.state.healthChecks,
      errors: this.state.errors
    };

    // Save report
    const reportPath = path.join(this.config.buildDir, 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    await this.generateHTMLReport(report);

    this.broadcast('reports-generated', { report });
  }

  async generateHTMLReport(report) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Profil3r Build Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        .warning { background-color: #fff3cd; color: #856404; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🚀 Profil3r Build Report</h1>
    <p><strong>Generated:</strong> ${report.timestamp}</p>

    <div class="status success">
        <h2>✅ Build Statistics</h2>
        <ul>
            <li>Build Count: ${report.buildCount}</li>
            <li>Test Count: ${report.testCount}</li>
            <li>Deploy Count: ${report.deployCount}</li>
        </ul>
    </div>

    <h2>🏗️ Service Status</h2>
    <table>
        <tr><th>Service</th><th>Status</th><th>Timestamp</th></tr>
        ${Object.entries(report.services)
          .map(
            ([name, status]) => `
            <tr>
                <td>${name}</td>
                <td class="${status.status === 'built' ? 'success' : 'error'}">${status.status}</td>
                <td>${status.timestamp}</td>
            </tr>
        `
          )
          .join('')}
    </table>

    <h2>🔍 Health Checks</h2>
    <table>
        <tr><th>Service</th><th>Status</th><th>Timestamp</th></tr>
        ${Object.entries(report.healthChecks)
          .map(
            ([name, health]) => `
            <tr>
                <td>${name}</td>
                <td class="${health.status === 'healthy' ? 'success' : 'error'}">${health.status}</td>
                <td>${health.timestamp}</td>
            </tr>
        `
          )
          .join('')}
    </table>

    ${
      report.errors.length > 0
        ? `
    <h2>❌ Errors</h2>
    <ul>
        ${report.errors
          .map(
            error => `
            <li class="error">
                <strong>${error.type}:</strong> ${error.message}
                <em>(${error.timestamp})</em>
            </li>
        `
          )
          .join('')}
    </ul>
    `
        : ''
    }

</body>
</html>`;

    const reportPath = path.join(this.config.buildDir, 'build-report.html');
    fs.writeFileSync(reportPath, htmlContent);
  }

  // === LEGACY METHODS FOR BACKWARD COMPATIBILITY ===

  async autoInstallDependencies() {
    console.log('🔄 Auto-installing dependencies...');
    this.broadcast('auto-install-started', {});

    try {
      // Proxy to dependencyManager
      await this.installDependencies();

      // Install additional dev dependencies
      await this.installDevDependencies();

      this.broadcast('auto-install-completed', { success: true });
      console.log('✅ Auto-install completed successfully');
    } catch (error) {
      console.error('❌ Auto-install failed:', error.message);
      this.broadcast('auto-install-failed', { error: error.message });
      throw error;
    }
  }

  async installDevDependencies() {
    const devDeps = [
      'eslint',
      'prettier',
      'jest',
      'mocha',
      'chai',
      'supertest',
      'cypress'
    ];

    for (const dep of devDeps) {
      if (!this.checkPackageInstalled(dep)) {
        console.log(`📦 Installing ${dep}...`);
        try {
          execSync(`npm install --save-dev ${dep}`, {
            cwd: this.config.projectRoot,
            stdio: 'inherit'
          });
        } catch (error) {
          console.warn(`⚠️ Failed to install ${dep}:`, error.message);
        }
      }
    }
  }

  async autoConfigureProject() {
    console.log('🔧 Auto-configuring project...');
    this.broadcast('auto-configure-started', {});

    try {
      // Proxy to autoFixEngine
      await this.autoFixEngine.fixConfigurationIssues();

      this.broadcast('auto-configure-completed', { success: true });
      console.log('✅ Auto-configure completed successfully');
    } catch (error) {
      console.error('❌ Auto-configure failed:', error.message);
      this.broadcast('auto-configure-failed', { error: error.message });
      throw error;
    }
  }

  async autoPushChanges() {
    console.log('📤 Auto-pushing changes...');
    this.broadcast('auto-push-started', {});

    try {
      // Proxy to deployer
      await this.deployChanges();

      this.broadcast('auto-push-completed', { success: true });
      console.log('✅ Auto-push completed successfully');
    } catch (error) {
      console.error('❌ Auto-push failed:', error.message);
      this.broadcast('auto-push-failed', { error: error.message });
      throw error;
    }
  }

  async runFullAutoCycle() {
    console.log('🔄 Running full auto-cycle...');
    this.broadcast('full-cycle-started', {});

    try {
      // 1. Auto-install dependencies
      await this.autoInstallDependencies();

      // 2. Auto-configure project
      await this.autoConfigureProject();

      // 3. Full build cycle
      await this.fullBuildCycle();

      // 4. Auto-push changes if enabled
      if (this.config.autoPush) {
        await this.autoPushChanges();
      }

      this.broadcast('full-cycle-completed', { success: true });
      console.log('✅ Full auto-cycle completed successfully');
    } catch (error) {
      console.error('❌ Full auto-cycle failed:', error.message);
      this.broadcast('full-cycle-failed', { error: error.message });
      throw error;
    }
  }

  // === UTILITY METHODS ===

  checkPackageInstalled(packageName) {
    try {
      const packageJsonPath = path.join(this.config.projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return (
        packageJson.dependencies?.[packageName] ||
        packageJson.devDependencies?.[packageName]
      );
    } catch {
      return false;
    }
  }

  checkCypressInstalled() {
    try {
      execSync('npx cypress --version', {
        stdio: 'pipe',
        cwd: this.config.projectRoot
      });
      return true;
    } catch {
      return false;
    }
  }

  parseCypressResults(output) {
    // Proxy to tester
    return this.tester.parseCypressResults(output);
  }

  async shutdown() {
    console.log('🛑 Shutting down Auto Build System...');

    // Stop file watchers
    this.watchers.forEach(watcher => watcher.close());

    // Stop services
    await this.stopAllServices();

    // Stop health monitoring
    this.stopHealthMonitoring();

    // Stop new module processes
    this.builder.stopAllBuilds();
    this.tester.stopAllTests();

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }

    console.log('✅ Auto Build System shut down');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (global.autoBuildSystem) {
    await global.autoBuildSystem.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (global.autoBuildSystem) {
    await global.autoBuildSystem.shutdown();
  }
  process.exit(0);
});

// Start the system
if (require.main === module) {
  global.autoBuildSystem = new AutoBuildSystem();
}

module.exports = AutoBuildSystem;
