const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');

class Tester {
  constructor(config, eventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.testing = false;
    this.testResults = {};
    this.testProcesses = {};
  }

  async runAllTests() {
    if (this.testing) {
      console.log('⏳ Tests already running...');
      return;
    }

    this.testing = true;
    const testId = Date.now();
    
    this.eventBus.broadcast('tests-started', { testId });

    try {
      console.log('🧪 Running all tests...');
      
      // Run unit tests (Jest/Mocha)
      await this.runUnitTests();
      
      // Run Cypress tests
      await this.runCypressTests();
      
      // Run integration tests
      await this.runIntegrationTests();
      
      // Calculate coverage
      await this.calculateCoverage();
      
      this.eventBus.broadcast('tests-completed', {
        testId,
        success: true,
        results: this.testResults
      });
      
      console.log('✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      this.eventBus.broadcast('tests-failed', {
        testId,
        error: error.message
      });
      throw error;
    } finally {
      this.testing = false;
    }
  }

  async runUnitTests() {
    console.log('🔬 Running unit tests...');
    
    for (const service of this.config.services) {
      if (service.type === 'node') {
        const servicePath = path.join(this.config.projectRoot, service.dir);
        const packageJsonPath = path.join(servicePath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf8')
          );

          if (packageJson.scripts && packageJson.scripts.test) {
            try {
              const result = execSync('npm test', {
                cwd: servicePath,
                encoding: 'utf8'
              });

              this.testResults[service.name] = {
                type: 'unit',
                status: 'passed',
                output: result,
                timestamp: new Date().toISOString()
              };

              this.eventBus.broadcast('unit-test-completed', {
                service: service.name,
                status: 'passed'
              });
              
            } catch (error) {
              this.testResults[service.name] = {
                type: 'unit',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
              };

              this.eventBus.broadcast('unit-test-failed', {
                service: service.name,
                error: error.message
              });
            }
          }
        }
      }
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
      this.testResults.cypress = {
        type: 'e2e',
        status: 'passed',
        result: cypressResult,
        timestamp: new Date().toISOString()
      };

      this.eventBus.broadcast('cypress-completed', { 
        result: cypressResult,
        status: 'passed'
      });
      
    } catch (error) {
      this.testResults.cypress = {
        type: 'e2e',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.eventBus.broadcast('cypress-failed', { 
        error: error.message 
      });
      
      throw new Error(`Cypress tests failed: ${error.message}`);
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Running integration tests...');
    
    const healthChecks = {};
    
    for (const service of this.config.services) {
      if (service.port) {
        try {
          const response = await axios.get(
            `http://localhost:${service.port}/health`,
            { timeout: 5000 }
          );

          healthChecks[service.name] = {
            status: 'healthy',
            response: response.data,
            timestamp: new Date().toISOString()
          };
          
        } catch (error) {
          healthChecks[service.name] = {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      }
    }

    this.testResults.integration = {
      type: 'integration',
      healthChecks,
      timestamp: new Date().toISOString()
    };

    this.eventBus.broadcast('integration-tests-completed', {
      healthChecks
    });
  }

  async calculateCoverage() {
    console.log('📊 Calculating test coverage...');
    
    try {
      // Run nyc for coverage
      const nycResult = execSync('npx nyc report --reporter=json', {
        cwd: this.config.projectRoot,
        encoding: 'utf8'
      });

      const coverage = JSON.parse(nycResult);
      this.testResults.coverage = {
        type: 'coverage',
        data: coverage,
        timestamp: new Date().toISOString()
      };

      const totalCoverage = coverage.total?.lines?.pct || 0;
      
      this.eventBus.broadcast('coverage-calculated', {
        coverage: totalCoverage,
        target: this.config.testCoverage,
        meets_target: totalCoverage >= this.config.testCoverage
      });

      if (totalCoverage < this.config.testCoverage) {
        throw new Error(
          `Coverage ${totalCoverage}% below target ${this.config.testCoverage}%`
        );
      }
      
    } catch (error) {
      console.warn('⚠️ Coverage calculation failed:', error.message);
      this.eventBus.broadcast('coverage-failed', {
        error: error.message
      });
    }
  }

  async runQuickTests(affectedServices) {
    console.log('⚡ Running quick tests...');
    
    for (const service of affectedServices) {
      if (service.port) {
        try {
          await axios.get(`http://localhost:${service.port}/health`, {
            timeout: 1000
          });
          
          console.log(`✅ ${service.name} quick test passed`);
          this.eventBus.broadcast('quick-test-passed', {
            service: service.name
          });
          
        } catch (error) {
          console.error(`❌ ${service.name} quick test failed`);
          this.eventBus.broadcast('quick-test-failed', {
            service: service.name,
            error: error.message
          });
        }
      }
    }
  }

  parseCypressResults(output) {
    const lines = output.split('\n');
    const stats = {
      tests: 0,
      passes: 0,
      failures: 0,
      duration: 0
    };

    lines.forEach(line => {
      if (line.includes('passing')) {
        const match = line.match(/(\d+) passing/);
        if (match) stats.passes = parseInt(match[1]);
      }
      if (line.includes('failing')) {
        const match = line.match(/(\d+) failing/);
        if (match) stats.failures = parseInt(match[1]);
      }
    });

    stats.tests = stats.passes + stats.failures;
    return { stats };
  }

  stopAllTests() {
    Object.values(this.testProcesses).forEach(process => {
      if (process && !process.killed) {
        process.kill();
      }
    });
    this.testProcesses = {};
  }

  getTestResults() {
    return this.testResults;
  }

  clearTestResults() {
    this.testResults = {};
  }
}

module.exports = Tester;
