const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DependencyManager {
  constructor(config) {
    this.config = config;
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    try {
      await this.installDependenciesForPath(this.config.projectRoot, 'root');
      for (const service of this.config.services) {
        if (service.type === 'node') {
          const servicePath = path.join(this.config.projectRoot, service.dir);
          if (fs.existsSync(path.join(servicePath, 'package.json'))) {
            console.log(`📦 Installing ${service.name} dependencies...`);
            await this.installDependenciesForPath(servicePath, service.name);
          }
        }
      }
    } catch (error) {
      throw new Error(`Dependency installation failed: ${error.message}`);
    }
  }

  async installDependenciesForPath(projectPath, name) {
    console.log(`Installing dependencies for ${name}...`);
    try {
      execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
      console.log(`Dependencies installed successfully for ${name}`);
    } catch (error) {
      console.log(
        `Standard install failed for ${name}, trying --legacy-peer-deps...`
      );
      try {
        execSync('npm install --legacy-peer-deps', {
          cwd: projectPath,
          stdio: 'inherit'
        });
        console.log(
          `Dependencies installed with --legacy-peer-deps for ${name}`
        );
      } catch (error2) {
        console.log(`Legacy peer deps failed for ${name}, trying --force...`);
        try {
          execSync('npm install --force', {
            cwd: projectPath,
            stdio: 'inherit'
          });
          console.log(`Dependencies installed with --force for ${name}`);
        } catch (error3) {
          return await this.autoFixDependencies(projectPath, name);
        }
      }
    }
  }

  async autoFixDependencies(projectPath, name) {
    console.log(`Auto-fixing dependencies for ${name}...`);
    try {
      execSync('npm cache clean --force', {
        cwd: projectPath,
        stdio: 'inherit'
      });
      execSync('rm -rf node_modules package-lock.json', {
        cwd: projectPath,
        stdio: 'inherit'
      });
      execSync('npm install --legacy-peer-deps', {
        cwd: projectPath,
        stdio: 'inherit'
      });
      console.log(`Dependencies auto-fixed successfully for ${name}`);
    } catch (error) {
      console.log(`Auto-fix failed for ${name}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = DependencyManager;
