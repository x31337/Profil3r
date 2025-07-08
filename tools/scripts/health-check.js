const axios = require('axios');

async function healthCheck() {
  const services = [
    'http://localhost:8000', // OSINT-Framework
    'http://localhost:4444', // facebook_mass_messenger
    'http://localhost:3000', // messenger_bot_framework (example port)
  ];

  for (const service of services) {
    try {
      const response = await axios.get(service);
      console.log(`Service at ${service} responded with status ${response.status}`);
    } catch (error) {
      console.error(`Service at ${service} is down or unreachable. Error: ${error.message}`);
    }
  }
}

healthCheck().then(() => {
  console.log('Health check completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Health check failed:', error);
  process.exit(1);
});
