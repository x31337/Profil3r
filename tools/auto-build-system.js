#!/usr/bin/env node

/**
 * Profil3r Auto Build System
 * Entry-point for the modular auto-build system
 * Imports required classes and maintains external compatibility
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const express = require('express');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const axios = require('axios');
const git = require('simple-git');

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
    // Check for legacy usage and warn
    if (process.argv.includes('--legacy')) {
      console.warn(
        '⚠️  You are using the legacy interface which is deprecated and will be removed in future versions. Consider moving to the updated API.'
      );
    }
    // Configuration setup (reused from legacy implementation)
    this.config = {
      projectRoot: process.cwd(),
      buildDir: path.join(process.cwd(), 'build'),
      logDir: path.join(process.cwd(), 'logs'),
      webPort: 9000,
      wsPort: 9001,
      services: [
        {
          name: 'Core Python Modules',
          dir: 'modules',
          port: null,
          type: 'python'
        },
        {
          name: 'Auto Build System',
          dir: 'tools',
          port: 9000,
          type: 'node'
        }
      ],
      autoFix: true,
      autoPush: true,
      realTimeMonitoring: true,
      testCoverage: 100,
      buildTimeout: 300000 // 5 minutes
    };

    // Preserve state object for backward-compat public API
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

    this.watchers = [];
    this.buildProcesses = {};
    this.testProcesses = {};

    // Initialize core modules
    this.eventBus = new EventBus();
    this.git = git();
    this.dependencyManager = new DependencyManager(this.config);
    this.serviceManager = new ServiceManager(this.config, this.eventBus);
    this.builder = new Builder(this.config, this.eventBus);
    this.tester = new Tester(this.config, this.eventBus);
    this.deployer = new Deployer(this.config, this.eventBus, this.git);
    this.autoFixEngine = new AutoFixEngine(this.config, this.eventBus);

    // Subscribe to EventBus events
    this.subscribeToEvents();

    this.init();
  }

  subscribeToEvents() {
    // Listen to build-started event
    this.eventBus.subscribe('build-started', ({ buildId }) => {
      this.state.building = true;
      this.state.lastBuild = buildId;
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to build-completed event
    this.eventBus.subscribe('build-completed', ({ buildId, success }) => {
      this.state.building = false;
      this.state.buildCount += 1;
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to build-failed event
    this.eventBus.subscribe('build-failed', ({ buildId, error }) => {
      this.state.building = false;
      this.state.errors.push({
        type: 'build',
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-started event
    this.eventBus.subscribe('service-started', ({ service, port, status }) => {
      this.state.services[service] = {
        status: status || 'running',
        port: port,
        startTime: new Date().toISOString()
      };
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-stopped event
    this.eventBus.subscribe('service-stopped', ({ service, status }) => {
      if (this.state.services[service]) {
        this.state.services[service].status = status || 'stopped';
        this.state.services[service].stopTime = new Date().toISOString();
      }
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-starting event
    this.eventBus.subscribe('service-starting', ({ service }) => {
      if (this.state.services[service]) {
        this.state.services[service].status = 'starting';
      }
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-stopping event
    this.eventBus.subscribe('service-stopping', ({ service }) => {
      if (this.state.services[service]) {
        this.state.services[service].status = 'stopping';
      }
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-restarting event
    this.eventBus.subscribe('service-restarting', ({ service }) => {
      if (this.state.services[service]) {
        this.state.services[service].status = 'restarting';
      }
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-restarted event
    this.eventBus.subscribe('service-restarted', ({ service, status }) => {
      if (this.state.services[service]) {
        this.state.services[service].status = status || 'running';
      }
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to all-services-started event
    this.eventBus.subscribe('all-services-started', ({ services }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to all-services-stopped event
    this.eventBus.subscribe('all-services-stopped', ({ services }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to health-checks-completed event
    this.eventBus.subscribe('health-checks-completed', ({ healthChecks }) => {
      this.state.healthChecks = healthChecks;
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-start-failed event
    this.eventBus.subscribe('service-start-failed', ({ service, error }) => {
      this.state.errors.push({
        type: 'service-start',
        service: service,
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-stop-failed event
    this.eventBus.subscribe('service-stop-failed', ({ service, error }) => {
      this.state.errors.push({
        type: 'service-stop',
        service: service,
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to service-restart-failed event
    this.eventBus.subscribe('service-restart-failed', ({ service, error }) => {
      this.state.errors.push({
        type: 'service-restart',
        service: service,
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to tests-started event
    this.eventBus.subscribe('tests-started', ({ testId }) => {
      this.state.testing = true;
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to tests-completed event
    this.eventBus.subscribe('tests-completed', result => {
      this.state.testing = false;
      this.state.testResults = result;
      this.state.testCount += 1;
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to tests-failed event
    this.eventBus.subscribe('tests-failed', ({ testId, error }) => {
      this.state.testing = false;
      this.state.errors.push({
        type: 'test',
        message: error,
        testId: testId,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to unit-test-completed event
    this.eventBus.subscribe('unit-test-completed', ({ service, status }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to unit-test-failed event
    this.eventBus.subscribe('unit-test-failed', ({ service, error }) => {
      this.state.errors.push({
        type: 'unit-test',
        service: service,
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to cypress-completed event
    this.eventBus.subscribe('cypress-completed', ({ result, status }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to cypress-failed event
    this.eventBus.subscribe('cypress-failed', ({ error }) => {
      this.state.errors.push({
        type: 'cypress',
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to integration-tests-completed event
    this.eventBus.subscribe(
      'integration-tests-completed',
      ({ healthChecks }) => {
        // Don't re-broadcast - event is already broadcasted by the source
      }
    );

    // Listen to coverage-calculated event
    this.eventBus.subscribe(
      'coverage-calculated',
      ({ coverage, target, meets_target }) => {
        // Don't re-broadcast - event is already broadcasted by the source
      }
    );

    // Listen to coverage-failed event
    this.eventBus.subscribe('coverage-failed', ({ error }) => {
      this.state.errors.push({
        type: 'coverage',
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to quick-test-passed event
    this.eventBus.subscribe('quick-test-passed', ({ service }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to quick-test-failed event
    this.eventBus.subscribe('quick-test-failed', ({ service, error }) => {
      this.state.errors.push({
        type: 'quick-test',
        service: service,
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to deployment-started event
    this.eventBus.subscribe('deployment-started', ({ deployId }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to deployment-completed event
    this.eventBus.subscribe('deployment-completed', ({ success, deployId }) => {
      this.state.deployCount += 1;
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to deployment-failed event
    this.eventBus.subscribe('deployment-failed', ({ deployId, error }) => {
      this.state.errors.push({
        type: 'deployment',
        message: error,
        deployId: deployId,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to component-built event
    this.eventBus.subscribe('component-built', ({ service, status }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to component-build-failed event
    this.eventBus.subscribe('component-build-failed', ({ service, error }) => {
      this.state.errors.push({
        type: 'component-build',
        service: service,
        message: error,
        timestamp: new Date().toISOString()
      });
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to incremental-build-completed event
    this.eventBus.subscribe(
      'incremental-build-completed',
      ({ changedFiles, affectedServices }) => {
        // Don't re-broadcast - event is already broadcasted by the source
      }
    );

    // Listen to incremental-build-failed event
    this.eventBus.subscribe(
      'incremental-build-failed',
      ({ service, error }) => {
        this.state.errors.push({
          type: 'incremental-build',
          service: service,
          message: error,
          timestamp: new Date().toISOString()
        });
        // Don't re-broadcast - event is already broadcasted by the source
      }
    );

    // Listen to auto-fix-started event
    this.eventBus.subscribe('auto-fix-started', ({ filePath }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to auto-fix-completed event
    this.eventBus.subscribe('auto-fix-completed', ({ filePath, fixes }) => {
      // Don't re-broadcast - event is already broadcasted by the source
    });

    // Listen to dependency-install-started event
    this.eventBus.subscribe(
      'dependency-install-started',
      ({ packageManager }) => {
        // Don't re-broadcast - event is already broadcasted by the source
      }
    );

    // Listen to dependency-install-completed event
    this.eventBus.subscribe(
      'dependency-install-completed',
      ({ packageManager, packages }) => {
        // Don't re-broadcast - event is already broadcasted by the source
      }
    );

    console.log('📡 EventBus subscriptions configured successfully');
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
    const app = express();
    app.use(express.static(path.join(__dirname, 'web-ui')));
    app.use(express.json());

    // API Routes - all delegate to high-level methods
    app.get('/api/status', (req, res) => {
      res.json({
        ...this.state,
        config: this.config,
        timestamp: new Date().toISOString()
      });
    });

    // Build endpoint - delegates to Builder module
    app.post('/api/build', async (req, res) => {
      try {
        const result = await this.fullBuildCycle();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Test endpoint - delegates to Tester module
    app.post('/api/test', async (req, res) => {
      try {
        const result = await this.runAllTests();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Deploy endpoint - delegates to Deployer module
    app.post('/api/deploy', async (req, res) => {
      try {
        const result = await this.deployChanges();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Fix endpoint - delegates to AutoFixEngine module
    app.post('/api/fix', async (req, res) => {
      try {
        const result = await this.autoFixIssues();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Cypress endpoint - delegates to Tester module
    app.post('/api/cypress', async (req, res) => {
      try {
        const result = await this.runCypressTests();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Full cycle endpoint - high-level orchestration
    app.post('/api/full-cycle', async (req, res) => {
      try {
        const result = await this.runFullAutoCycle();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Auto-install dependencies endpoint - delegates to DependencyManager
    app.post('/api/auto-install', async (req, res) => {
      try {
        const result = await this.autoInstallDependencies();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Auto-configure endpoint - delegates to DependencyManager
    app.post('/api/auto-configure', async (req, res) => {
      try {
        const result = await this.autoConfigureProject();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Auto-push endpoint - delegates to Deployer module
    app.post('/api/auto-push', async (req, res) => {
      try {
        const result = await this.autoPushChanges();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Services management - delegates to ServiceManager
    app.post('/api/services/start', async (req, res) => {
      try {
        const result = await this.serviceManager.startAllServices();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/services/stop', async (req, res) => {
      try {
        const result = await this.serviceManager.stopAllServices();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/services/:service/start', async (req, res) => {
      try {
        const { service } = req.params;
        const result = await this.serviceManager.startService(service);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/services/:service/stop', async (req, res) => {
      try {
        const { service } = req.params;
        const result = await this.serviceManager.stopService(service);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/services/:service/restart', async (req, res) => {
      try {
        const { service } = req.params;
        const result = await this.serviceManager.restartService(service);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
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
          // All WebSocket commands delegate to high-level methods
          switch (type) {
            case 'build':
              await this.fullBuildCycle();
              break;
            case 'test':
              await this.runAllTests();
              break;
            case 'deploy':
              await this.deployChanges();
              break;
            case 'fix':
              await this.autoFixIssues();
              break;
            case 'auto-install':
              await this.autoInstallDependencies();
              break;
            case 'auto-configure':
              await this.autoConfigureProject();
              break;
            case 'auto-push':
              await this.autoPushChanges();
              break;
            case 'cypress':
              await this.runCypressTests();
              break;
            case 'full-cycle':
              await this.runFullAutoCycle();
              break;
            case 'start-service':
              if (data && data.service) {
                await this.serviceManager.startService(data.service);
              } else {
                await this.serviceManager.startAllServices();
              }
              break;
            case 'stop-service':
              if (data && data.service) {
                await this.serviceManager.stopService(data.service);
              } else {
                await this.serviceManager.stopAllServices();
              }
              break;
            case 'restart-service':
              if (data && data.service) {
                await this.serviceManager.restartService(data.service);
              }
              break;
            default:
              console.warn(`Unknown WebSocket command: ${type}`);
              this.broadcast('command-failed', {
                type,
                error: 'Unknown command'
              });
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
    // Use EventBus to broadcast to WebSocket clients and emit events
    this.eventBus.broadcastToWebSocket(this.wss, type, data);
  }

  // Direct EventBus event emission (for cases where we want event-only, no WebSocket)
  emitEvent(eventType, data) {
    this.eventBus.broadcast(eventType, data);
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
      ignored: /(^|[\/\\])\../, // ignore dotfiles
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
    if (this.state.buildQueue.length === 0) {
      this.state.buildQueue.push(triggerFile);

      // Debounce builds
      setTimeout(async () => {
        if (this.state.buildQueue.length > 0) {
          const files = [...this.state.buildQueue];
          this.state.buildQueue = [];
          await this.incrementalBuild(files);
        }
      }, 2000);
    } else {
      this.state.buildQueue.push(triggerFile);
    }
  }

  // Delegate to Builder module
  async fullBuildCycle() {
    return this.builder.fullBuild();
  }

  async incrementalBuild(files) {
    return this.builder.incrementalBuild(files);
  }

  // Delegate to Tester module
  async runAllTests() {
    return this.tester.runAllTests();
  }

  async runCypressTests() {
    return this.tester.runCypressTests();
  }

  // Delegate to Deployer module
  async deployChanges() {
    return this.deployer.deployChanges();
  }

  // Delegate to AutoFixEngine module
  async autoFixIssues() {
    return this.autoFixEngine.autoFixIssues();
  }

  async autoFixFile(filePath) {
    return this.autoFixEngine.autoFixFile(filePath);
  }

  // Delegate to DependencyManager module
  async autoInstallDependencies() {
    return this.dependencyManager.autoInstallDependencies();
  }

  async autoConfigureProject() {
    return this.dependencyManager.autoConfigureProject();
  }

  async autoPushChanges() {
    return this.deployer.autoPushChanges();
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

      // 4. Run Cypress tests
      await this.runCypressTests();

      // 5. Auto-push changes
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

  startHealthMonitoring() {
    // Delegate health monitoring to ServiceManager
    return this.serviceManager.startHealthMonitoring();
  }

  async shutdown() {
    console.log('🛑 Shutting down Auto Build System...');

    // Stop file watchers
    this.watchers.forEach(watcher => watcher.close());

    // Stop modules (delegate to each module's shutdown method)
    if (this.serviceManager) {
      await this.serviceManager.shutdown();
    }
    if (this.builder) {
      await this.builder.shutdown();
    }
    if (this.tester) {
      await this.tester.shutdown();
    }
    if (this.deployer) {
      await this.deployer.shutdown();
    }
    if (this.autoFixEngine) {
      await this.autoFixEngine.shutdown();
    }
    if (this.dependencyManager) {
      await this.dependencyManager.shutdown();
    }

    // Stop legacy processes (for backward compatibility)
    Object.values(this.buildProcesses).forEach(process => {
      if (process && !process.killed) {
        process.kill();
      }
    });

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
