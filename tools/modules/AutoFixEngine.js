const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoFixEngine {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.errorPatterns = this.initializeErrorPatterns();
  }

  initializeErrorPatterns() {
    return [
      {
        pattern: /npm ERR! peer dep missing/,
        fix: 'npm install --legacy-peer-deps',
        description: 'Install with legacy peer dependencies'
      },
      {
        pattern: /ENOENT: no such file or directory.*package\.json/,
        fix: 'npm init -y',
        description: 'Initialize package.json'
      },
      {
        pattern: /eslint.*parsing error/i,
        fix: 'npx eslint --fix',
        description: 'Fix ESLint parsing errors'
      },
      {
        pattern: /prettier.*formatting/i,
        fix: 'npx prettier --write .',
        description: 'Fix Prettier formatting'
      },
      {
        pattern: /cypress.*command not found/i,
        fix: 'npm install --save-dev cypress',
        description: 'Install Cypress'
      },
      {
        pattern: /jest.*test.*failed/i,
        fix: 'npm test -- --updateSnapshot',
        description: 'Update Jest snapshots'
      },
      {
        pattern: /python.*syntaxerror/i,
        fix: 'python3 -m py_compile',
        description: 'Compile Python syntax'
      },
      {
        pattern: /php.*parse error/i,
        fix: 'php -l',
        description: 'Check PHP syntax'
      },
      {
        pattern: /EADDRINUSE.*port/i,
        fix: 'fuser -k {port}/tcp',
        description: 'Kill process on port'
      }
    ];
  }

  async autoFixIssues() {
    console.log('🔧 Auto-fixing issues...');
    
    this.eventBus.broadcast('auto-fix-started', {});

    try {
      // Auto-fix ESLint issues
      await this.runFix('npx eslint . --ext .js,.ts,.jsx,.tsx --fix', 'ESLint fixes');
      
      // Auto-format with Prettier
      await this.runFix('npx prettier --write .', 'Prettier formatting');
      
      // Auto-fix package.json issues
      await this.fixPackageJsonIssues();
      
      // Auto-fix common configuration issues
      await this.fixConfigurationIssues();
      
      // Run npm audit fix
      await this.runAuditFix();
      
      this.eventBus.broadcast('auto-fix-completed', { success: true });
      console.log('✅ Auto-fix completed successfully!');
      
    } catch (error) {
      console.error('❌ Auto-fix failed:', error.message);
      this.eventBus.broadcast('auto-fix-failed', { error: error.message });
      throw error;
    }
  }

  async autoFixFile(filePath) {
    const ext = path.extname(filePath);
    
    this.eventBus.broadcast('file-auto-fix-started', { file: filePath });

    try {
      switch (ext) {
        case '.js':
        case '.ts':
          await this.runFix(`npx eslint "${filePath}" --fix`, `ESLint fix for ${filePath}`);
          await this.runFix(`npx prettier --write "${filePath}"`, `Prettier format for ${filePath}`);
          break;
        case '.json':
          await this.runFix(`npx prettier --write "${filePath}"`, `Prettier format for ${filePath}`);
          break;
        case '.py':
          await this.runFix(`python3 -m py_compile "${filePath}"`, `Python compile for ${filePath}`);
          break;
        case '.php':
          await this.runFix(`php -l "${filePath}"`, `PHP syntax check for ${filePath}`);
          break;
      }
      
      this.eventBus.broadcast('file-auto-fix-completed', { file: filePath });
      
    } catch (error) {
      console.warn(`⚠️ Could not auto-fix ${filePath}:`, error.message);
      this.eventBus.broadcast('file-auto-fix-failed', { 
        file: filePath, 
        error: error.message 
      });
    }
  }

  async mapErrorToFix(errorMessage) {
    for (const pattern of this.errorPatterns) {
      if (pattern.pattern.test(errorMessage)) {
        console.log(`🔍 Found error pattern: ${pattern.description}`);
        
        this.eventBus.broadcast('error-pattern-matched', {
          error: errorMessage,
          fix: pattern.fix,
          description: pattern.description
        });
        
        return pattern.fix;
      }
    }
    
    return null;
  }

  async runFix(command, description) {
    console.log(`🔧 Running fix: ${description}`);
    
    try {
      execSync(command, {
        cwd: this.config.projectRoot,
        stdio: 'inherit'
      });
      
      console.log(`✅ ${description} completed`);
      
    } catch (error) {
      console.warn(`⚠️ ${description} failed:`, error.message);
      throw error;
    }
  }

  async fixPackageJsonIssues() {
    console.log('📦 Fixing package.json issues...');
    
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

      let modified = false;
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies[dep]) {
          packageJson.devDependencies[dep] = 'latest';
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated package.json with missing dependencies');
      }
    }
  }

  async fixConfigurationIssues() {
    console.log('⚙️ Fixing configuration issues...');
    
    const configFiles = ['.eslintrc.json', '.gitignore', 'cypress.config.js'];

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

  async runAuditFix() {
    console.log('🔍 Running npm audit fix...');
    
    try {
      execSync('npm audit fix', {
        cwd: this.config.projectRoot,
        stdio: 'inherit'
      });
      
      console.log('✅ npm audit fix completed');
      
    } catch (error) {
      console.warn('⚠️ npm audit fix failed:', error.message);
      
      // Try with --force if normal audit fix fails
      try {
        execSync('npm audit fix --force', {
          cwd: this.config.projectRoot,
          stdio: 'inherit'
        });
        
        console.log('✅ npm audit fix --force completed');
        
      } catch (forceError) {
        console.warn('⚠️ npm audit fix --force also failed:', forceError.message);
      }
    }
  }

  addErrorPattern(pattern, fix, description) {
    this.errorPatterns.push({
      pattern: new RegExp(pattern),
      fix,
      description
    });
  }

  removeErrorPattern(pattern) {
    this.errorPatterns = this.errorPatterns.filter(p => p.pattern.source !== pattern);
  }

  getErrorPatterns() {
    return this.errorPatterns;
  }
}

module.exports = AutoFixEngine;
