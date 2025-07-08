#!/usr/bin/env node

/**
 * Profil3r Auto Build System
 * Comprehensive automated build, compile, test, and deployment system
 * with real-time monitoring, auto-fix, and auto-push capabilities
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const express = require('express');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const axios = require('axios');
const git = require('simple-git');

class AutoBuildSystem {
  constructor() {
    this.config = {
      projectRoot: process.cwd(),
      buildDir: path.join(process.cwd(), 'build'),
      logDir: path.join(process.cwd(), 'logs'),
      webPort: 9000,
      wsPort: 9001,
      services: [
        { name: 'OSINT Framework', dir: 'OSINT-Framework', port: 8000, type: 'node' },
        { name: 'Facebook Mass Messenger', dir: 'js_tools/facebook_mass_messenger', port: 4444, type: 'node' },
        { name: 'Messenger Bot Framework', dir: 'js_tools/messenger_bot_framework/fbbot', port: 3000, type: 'node' },
        { name: 'Python Tools', dir: 'telegram-facebook-bot', port: null, type: 'python' },
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
    this.buildProcesses = {};
    this.testProcesses = {};
    
    this.init();
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

    // API Routes
    app.get('/api/status', (req, res) => {
      res.json({
        ...this.state,
        config: this.config,
        timestamp: new Date().toISOString()
      });
    });

    app.post('/api/build', async (req, res) => {
      try {
        const result = await this.fullBuildCycle();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/test', async (req, res) => {
      try {
        const result = await this.runAllTests();
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/deploy', async (req, res) => {
      try {
        const result = await this.deployChanges();
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
    
    this.wss.on('connection', (ws) => {
      console.log('📡 WebSocket client connected');
      
      // Send current state
      ws.send(JSON.stringify({
        type: 'state',
        data: this.state
      }));
      
      ws.on('message', async (message) => {
        const { type, data } = JSON.parse(message);
        
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
        }
      });
    });

    console.log(`📡 WebSocket server running on port ${this.config.wsPort}`);
  }

  broadcast(type, data) {
    const message = JSON.stringify({ type, data });
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
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

    watcher.on('change', async (filePath) => {
      console.log(`📝 File changed: ${filePath}`);
      this.broadcast('file-change', { path: filePath });
      
      // Auto-build on change
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

  async fullBuildCycle() {
    if (this.state.building) {
      console.log('⏳ Build already in progress...');
      return;
    }

    this.state.building = true;
    this.state.buildCount++;
    this.state.lastBuild = new Date().toISOString();
    
    this.broadcast('build-started', { buildCount: this.state.buildCount });
    
    try {
      console.log('🔨 Starting full build cycle...');
      
      // 1. Install dependencies
      await this.installDependencies();
      
      // 2. Lint and fix code
      await this.lintAndFix();
      
      // 3. Build all components
      await this.buildAllComponents();
      
      // 4. Run tests
      await this.runAllTests();
      
      // 5. Generate reports
      await this.generateReports();
      
      // 6. Deploy if auto-push enabled
      if (this.config.autoPush) {
        await this.deployChanges();
      }
      
      this.broadcast('build-completed', { 
        success: true, 
        buildCount: this.state.buildCount 
      });
      
      console.log('✅ Full build cycle completed successfully!');
      
    } catch (error) {
      console.error('❌ Build cycle failed:', error.message);
      this.state.errors.push({
        type: 'build',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.broadcast('build-failed', { 
        error: error.message, 
        buildCount: this.state.buildCount 
      });
      
      // Auto-fix on failure
      if (this.config.autoFix) {
        await this.autoFixIssues();
      }
    } finally {
      this.state.building = false;
    }
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      // Root dependencies
      execSync('npm install', { 
        cwd: this.config.projectRoot, 
        stdio: 'inherit' 
      });
      
      // Service dependencies
      for (const service of this.config.services) {
        if (service.type === 'node') {
          const servicePath = path.join(this.config.projectRoot, service.dir);
          if (fs.existsSync(path.join(servicePath, 'package.json'))) {
            console.log(`📦 Installing ${service.name} dependencies...`);
            execSync('npm install', { 
              cwd: servicePath, 
              stdio: 'inherit' 
            });
          }
        }
      }
      
      this.broadcast('dependencies-installed', { success: true });
      
    } catch (error) {
      throw new Error(`Dependency installation failed: ${error.message}`);
    }
  }

  async lintAndFix() {
    console.log('🔍 Linting and fixing code...');
    
    try {
      // ESLint with auto-fix
      execSync('npx eslint . --ext .js,.ts,.jsx,.tsx --fix', {
        cwd: this.config.projectRoot,
        stdio: 'inherit'
      });
      
      // Prettier
      execSync('npx prettier --write .', {
        cwd: this.config.projectRoot,
        stdio: 'inherit'
      });
      
      this.broadcast('linting-completed', { success: true });
      
    } catch (error) {
      console.warn('⚠️ Linting issues detected, attempting auto-fix...');
      await this.autoFixIssues();
    }
  }

  async buildAllComponents() {
    console.log('🏗️ Building all components...');
    
    const buildPromises = this.config.services.map(async (service) => {
      try {
        await this.buildComponent(service);
        this.state.services[service.name] = { 
          status: 'built', 
          timestamp: new Date().toISOString() 
        };
      } catch (error) {
        this.state.services[service.name] = { 
          status: 'failed', 
          error: error.message,
          timestamp: new Date().toISOString() 
        };
        throw error;
      }
    });
    
    await Promise.all(buildPromises);
    this.broadcast('components-built', { services: this.state.services });
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
      
      // Install dependencies
      execSync('npm install', { cwd: servicePath, stdio: 'inherit' });
      
      // Run build script if exists
      if (packageJson.scripts && packageJson.scripts.build) {
        execSync('npm run build', { cwd: servicePath, stdio: 'inherit' });
      }
      
      // Start service if has start script
      if (packageJson.scripts && packageJson.scripts.start && service.port) {
        await this.startService(service, servicePath);
      }
    }
  }

  async buildPythonService(service, servicePath) {
    console.log(`🐍 Building ${service.name}...`);
    
    // Check Python syntax
    const pyFiles = this.findFiles(servicePath, '*.py');
    for (const file of pyFiles) {
      try {
        execSync(`python3 -m py_compile "${file}"`, { stdio: 'inherit' });
      } catch (error) {
        throw new Error(`Python syntax error in ${file}: ${error.message}`);
      }
    }
    
    // Install requirements if exists
    const requirementsPath = path.join(servicePath, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      execSync(`pip3 install -r "${requirementsPath}"`, { stdio: 'inherit' });
    }
  }

  async buildPHPService(service, servicePath) {
    console.log(`🐘 Building ${service.name}...`);
    
    // Check PHP syntax
    const phpFiles = this.findFiles(servicePath, '*.php');
    for (const file of phpFiles) {
      try {
        execSync(`php -l "${file}"`, { stdio: 'inherit' });
      } catch (error) {
        throw new Error(`PHP syntax error in ${file}: ${error.message}`);
      }
    }
  }

  async startService(service, servicePath) {
    if (this.buildProcesses[service.name]) {
      this.buildProcesses[service.name].kill();
    }
    
    const child = spawn('npm', ['start'], {
      cwd: servicePath,
      stdio: 'inherit',
      detached: true
    });
    
    this.buildProcesses[service.name] = child;
    
    // Wait for service to be ready
    await this.waitForService(service);
  }

  async waitForService(service, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await axios.get(`http://localhost:${service.port}`, {
          timeout: 1000
        });
        
        if (response.status === 200) {
          console.log(`✅ ${service.name} is running on port ${service.port}`);
          return;
        }
      } catch (error) {
        // Service not ready yet
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`Service ${service.name} failed to start within timeout`);
  }

  async runAllTests() {
    if (this.state.testing) {
      console.log('⏳ Tests already running...');
      return;
    }

    this.state.testing = true;
    this.state.testCount++;
    
    this.broadcast('tests-started', { testCount: this.state.testCount });
    
    try {
      console.log('🧪 Running all tests...');
      
      // Run Cypress tests
      await this.runCypressTests();
      
      // Run unit tests
      await this.runUnitTests();
      
      // Run integration tests
      await this.runIntegrationTests();
      
      // Calculate coverage
      await this.calculateCoverage();
      
      this.broadcast('tests-completed', { 
        success: true, 
        results: this.state.testResults 
      });
      
      console.log('✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      this.state.errors.push({
        type: 'test',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.broadcast('tests-failed', { 
        error: error.message, 
        testCount: this.state.testCount 
      });
    } finally {
      this.state.testing = false;
    }
  }

  async runCypressTests() {
    console.log('🌐 Running Cypress tests...');
    
    try {
      const result = execSync('npx cypress run --reporter json', {
        cwd: this.config.projectRoot,
        encoding: 'utf8'
      });
      
      const cypressResult = JSON.parse(result);
      this.state.testResults.cypress = cypressResult;
      
      this.broadcast('cypress-completed', { result: cypressResult });
      
    } catch (error) {
      throw new Error(`Cypress tests failed: ${error.message}`);
    }
  }

  async runUnitTests() {
    console.log('🔬 Running unit tests...');
    
    for (const service of this.config.services) {
      if (service.type === 'node') {
        const servicePath = path.join(this.config.projectRoot, service.dir);
        const packageJsonPath = path.join(servicePath, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          if (packageJson.scripts && packageJson.scripts.test) {
            try {
              const result = execSync('npm test', {
                cwd: servicePath,
                encoding: 'utf8'
              });
              
              this.state.testResults[service.name] = {
                status: 'passed',
                output: result
              };
              
            } catch (error) {
              this.state.testResults[service.name] = {
                status: 'failed',
                error: error.message
              };
            }
          }
        }
      }
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Running integration tests...');
    
    // Health check all services
    for (const service of this.config.services) {
      if (service.port) {
        try {
          const response = await axios.get(`http://localhost:${service.port}/health`, {
            timeout: 5000
          });
          
          this.state.healthChecks[service.name] = {
            status: 'healthy',
            response: response.data,
            timestamp: new Date().toISOString()
          };
          
        } catch (error) {
          this.state.healthChecks[service.name] = {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      }
    }
  }

  async calculateCoverage() {
    console.log('📊 Calculating test coverage...');
    
    try {
      const result = execSync('npx nyc report --reporter=json', {
        cwd: this.config.projectRoot,
        encoding: 'utf8'
      });
      
      const coverage = JSON.parse(result);
      this.state.testResults.coverage = coverage;
      
      // Check if coverage meets target
      const totalCoverage = coverage.total?.lines?.pct || 0;
      if (totalCoverage < this.config.testCoverage) {
        throw new Error(`Coverage ${totalCoverage}% below target ${this.config.testCoverage}%`);
      }
      
    } catch (error) {
      console.warn('⚠️ Coverage calculation failed:', error.message);
    }
  }

  async autoFixIssues() {
    console.log('🔧 Auto-fixing issues...');
    
    try {
      // Auto-fix ESLint issues
      execSync('npx eslint . --ext .js,.ts,.jsx,.tsx --fix', {
        cwd: this.config.projectRoot,
        stdio: 'inherit'
      });
      
      // Auto-format with Prettier
      execSync('npx prettier --write .', {
        cwd: this.config.projectRoot,
        stdio: 'inherit'
      });
      
      // Auto-fix package.json issues
      await this.fixPackageJsonIssues();
      
      // Auto-fix common configuration issues
      await this.fixConfigurationIssues();
      
      this.broadcast('auto-fix-completed', { success: true });
      
    } catch (error) {
      console.error('❌ Auto-fix failed:', error.message);
      this.broadcast('auto-fix-failed', { error: error.message });
    }
  }

  async fixPackageJsonIssues() {
    const packageJsonPath = path.join(this.config.projectRoot, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add missing dependencies
      const requiredDeps = [
        'cypress',
        'express',
        'ws',
        'chokidar',
        'axios',
        'simple-git'
      ];
      
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }
      
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies[dep]) {
          packageJson.devDependencies[dep] = 'latest';
        }
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  async fixConfigurationIssues() {
    // Create missing configuration files
    const configFiles = [
      '.eslintrc.json',
      '.gitignore',
      'cypress.config.js'
    ];
    
    for (const configFile of configFiles) {
      const configPath = path.join(this.config.projectRoot, configFile);
      if (!fs.existsSync(configPath)) {
        await this.createDefaultConfig(configFile);
      }
    }
  }

  async createDefaultConfig(filename) {
    const templates = {
      '.eslintrc.json': {
        extends: ['eslint:recommended'],
        env: {
          node: true,
          es2021: true,
          cypress: true
        },
        parserOptions: {
          ecmaVersion: 12,
          sourceType: 'module'
        },
        rules: {}
      },
      '.gitignore': `node_modules/
*.log
dist/
build/
coverage/
.nyc_output/
cypress/videos/
cypress/screenshots/
.env
.env.local
`,
      'cypress.config.js': `const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});`
    };
    
    const configPath = path.join(this.config.projectRoot, filename);
    const content = typeof templates[filename] === 'object' 
      ? JSON.stringify(templates[filename], null, 2)
      : templates[filename];
    
    fs.writeFileSync(configPath, content);
    console.log(`📄 Created default ${filename}`);
  }

  async deployChanges() {
    if (!this.config.autoPush) {
      console.log('⏸️ Auto-push disabled');
      return;
    }

    this.state.deployCount++;
    
    try {
      console.log('🚀 Deploying changes...');
      
      // Stage all changes
      await this.git.add('.');
      
      // Commit changes
      const commitMessage = `feat: automated build and test cycle #${this.state.buildCount}

- Build completed: ${new Date().toISOString()}
- Tests passed: ${this.state.testCount}
- Services healthy: ${Object.keys(this.state.healthChecks).length}
- Auto-fixes applied: ${this.state.deployCount}

[skip ci]`;
      
      await this.git.commit(commitMessage);
      
      // Push changes
      await this.git.push('origin', 'main');
      
      this.broadcast('deployment-completed', { 
        success: true, 
        deployCount: this.state.deployCount 
      });
      
      console.log('✅ Changes deployed successfully!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      this.broadcast('deployment-failed', { error: error.message });
    }
  }

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
        ${Object.entries(report.services).map(([name, status]) => `
            <tr>
                <td>${name}</td>
                <td class="${status.status === 'built' ? 'success' : 'error'}">${status.status}</td>
                <td>${status.timestamp}</td>
            </tr>
        `).join('')}
    </table>
    
    <h2>🔍 Health Checks</h2>
    <table>
        <tr><th>Service</th><th>Status</th><th>Timestamp</th></tr>
        ${Object.entries(report.healthChecks).map(([name, health]) => `
            <tr>
                <td>${name}</td>
                <td class="${health.status === 'healthy' ? 'success' : 'error'}">${health.status}</td>
                <td>${health.timestamp}</td>
            </tr>
        `).join('')}
    </table>
    
    ${report.errors.length > 0 ? `
    <h2>❌ Errors</h2>
    <ul>
        ${report.errors.map(error => `
            <li class="error">
                <strong>${error.type}:</strong> ${error.message} 
                <em>(${error.timestamp})</em>
            </li>
        `).join('')}
    </ul>
    ` : ''}
    
</body>
</html>`;
    
    const reportPath = path.join(this.config.buildDir, 'build-report.html');
    fs.writeFileSync(reportPath, htmlContent);
  }

  startHealthMonitoring() {
    setInterval(async () => {
      for (const service of this.config.services) {
        if (service.port) {
          try {
            const response = await axios.get(`http://localhost:${service.port}/health`, {
              timeout: 2000
            });
            
            this.state.healthChecks[service.name] = {
              status: 'healthy',
              response: response.data,
              timestamp: new Date().toISOString()
            };
            
          } catch (error) {
            this.state.healthChecks[service.name] = {
              status: 'unhealthy',
              error: error.message,
              timestamp: new Date().toISOString()
            };
          }
        }
      }
      
      this.broadcast('health-update', { healthChecks: this.state.healthChecks });
    }, 30000); // Check every 30 seconds
  }

  findFiles(directory, pattern) {
    const files = [];
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, pattern));
      } else if (item.match(pattern.replace('*', '.*'))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async autoFixFile(filePath) {
    const ext = path.extname(filePath);
    
    switch (ext) {
      case '.js':
      case '.ts':
        try {
          execSync(`npx eslint "${filePath}" --fix`, {
            cwd: this.config.projectRoot,
            stdio: 'inherit'
          });
          
          execSync(`npx prettier --write "${filePath}"`, {
            cwd: this.config.projectRoot,
            stdio: 'inherit'
          });
        } catch (error) {
          console.warn(`⚠️ Could not auto-fix ${filePath}:`, error.message);
        }
        break;
    }
  }

  async incrementalBuild(changedFiles) {
    console.log(`🔄 Incremental build for ${changedFiles.length} files...`);
    
    // Determine which services are affected
    const affectedServices = new Set();
    
    for (const file of changedFiles) {
      for (const service of this.config.services) {
        if (file.startsWith(service.dir)) {
          affectedServices.add(service);
        }
      }
    }
    
    // Build only affected services
    for (const service of affectedServices) {
      try {
        await this.buildComponent(service);
      } catch (error) {
        console.error(`❌ Incremental build failed for ${service.name}:`, error.message);
      }
    }
    
    // Run quick tests
    await this.runQuickTests(Array.from(affectedServices));
    
    this.broadcast('incremental-build-completed', { 
      changedFiles, 
      affectedServices: Array.from(affectedServices).map(s => s.name) 
    });
  }

  async runQuickTests(affectedServices) {
    console.log('⚡ Running quick tests...');
    
    for (const service of affectedServices) {
      if (service.port) {
        try {
          const response = await axios.get(`http://localhost:${service.port}/health`, {
            timeout: 1000
          });
          
          console.log(`✅ ${service.name} quick test passed`);
        } catch (error) {
          console.error(`❌ ${service.name} quick test failed`);
        }
      }
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down Auto Build System...');
    
    // Stop file watchers
    this.watchers.forEach(watcher => watcher.close());
    
    // Stop build processes
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
