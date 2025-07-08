const { defineConfig } = require('cypress');
const {
  addMatchImageSnapshotPlugin
} = require('cypress-image-snapshot/plugin');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // Add image snapshot plugin
      addMatchImageSnapshotPlugin(on, config);

      // Custom task for mobile viewport testing
      on('task', {
        setMobileViewport(device) {
          if (device === 'iphone-6') {
            config.viewportWidth = 375;
            config.viewportHeight = 667;
          } else if (device === 'ipad-2') {
            config.viewportWidth = 768;
            config.viewportHeight = 1024;
          }
          return config;
        },
        
        // Auto-build system integration tasks
        autoBuildNotify({ type, data }) {
          // Send notifications to auto-build system
          const WebSocket = require('ws');
          try {
            const ws = new WebSocket('ws://localhost:9001');
            ws.on('open', () => {
              ws.send(JSON.stringify({
                type: 'cypress-event',
                data: { type, data }
              }));
              ws.close();
            });
          } catch (error) {
            console.log('Auto-build system not available');
          }
          return null;
        },
        
        // Health check task
        healthCheck(url) {
          return new Promise((resolve) => {
            const axios = require('axios');
            axios.get(url, { timeout: 5000 })
              .then(response => resolve({ status: 'healthy', code: response.status }))
              .catch(error => resolve({ status: 'unhealthy', error: error.message }));
          });
        }
      });

      return config;
    }
  },
  env: {
    osint_url: 'http://localhost:8000',
    mass_messenger_url: 'http://localhost:4444',
    messenger_bot_url: 'http://localhost:3000',
    auto_build_url: 'http://localhost:9000',
    // Visual regression testing settings
    failOnSnapshotDiff: false,
    updateSnapshots: false,
    // Mobile device settings
    device: 'desktop',
    // Auto-build integration
    autoFixOnFailure: true,
    notifyAutoBuild: true
  }
});
