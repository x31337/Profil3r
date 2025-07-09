const axios = require('axios');

/**
 * Wait for a service to be ready by polling its endpoint
 * @param {Object} service - Service configuration object
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<void>} Resolves when service is ready
 * @throws {Error} If service fails to start within timeout
 */
async function waitForService(service, timeout = 30000) {
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

module.exports = {
  waitForService
};
