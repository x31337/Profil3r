const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>JS Tools - Facebook Messenger Bot Framework</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { color: green; font-size: 18px; margin: 10px 0; }
        .service { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #007bff; }
        .service h3 { margin-top: 0; color: #007bff; }
        .service a { color: #007bff; text-decoration: none; }
        .service a:hover { text-decoration: underline; }
        .info { background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 JS Tools - Facebook Messenger Bot Framework</h1>
          <p class="status">✅ Server is running on port ${PORT}</p>
        </div>

        <div class="service">
          <h3>📨 Facebook Mass Messenger</h3>
          <p>Send mass messages on Facebook Messenger with an intuitive web interface.</p>
          <p><strong>Features:</strong> Session management, message templating, friend list management</p>
          <p><a href="/facebook-mass-messenger/">Open Facebook Mass Messenger</a></p>
        </div>

        <div class="service">
          <h3>🤖 Messenger Bot Framework</h3>
          <p>Minimal framework/SDK for Facebook Messenger bots. BYOS (Bring Your Own Server)</p>
          <p><strong>Features:</strong> Webhook handling, message processing, bot templates</p>
          <p><a href="/messenger-bot-framework/">Open Messenger Bot Framework</a></p>
        </div>

        <div class="info">
          <h3>🔧 Health Check</h3>
          <p>API endpoint for health monitoring: <a href="/api/health">/api/health</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'js-tools-bot-framework',
    port: PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Facebook Mass Messenger routing
app.use('/facebook-mass-messenger', (req, res, next) => {
  // Check if the facebook_mass_messenger directory exists
  const facebookMessengerPath = path.join(__dirname, 'facebook_mass_messenger');
  try {
    require.resolve(path.join(facebookMessengerPath, 'index.js'));
    // If it exists, proxy to the Facebook Mass Messenger app
    res.redirect('/facebook-mass-messenger-service');
  } catch (error) {
    res.send(`
      <h1>Facebook Mass Messenger Service</h1>
      <p>Service temporarily unavailable. Please check the facebook_mass_messenger directory.</p>
      <p><a href="/">← Back to main page</a></p>
    `);
  }
});

// Messenger Bot Framework routing
app.use('/messenger-bot-framework', (req, res, next) => {
  // Check if the messenger_bot_framework directory exists
  const messengerBotPath = path.join(__dirname, 'messenger_bot_framework');
  try {
    require.resolve(path.join(messengerBotPath, 'test-server.js'));
    // If it exists, proxy to the Messenger Bot Framework
    res.redirect('/messenger-bot-service');
  } catch (error) {
    res.send(`
      <h1>Messenger Bot Framework Service</h1>
      <p>Service temporarily unavailable. Please check the messenger_bot_framework directory.</p>
      <p><a href="/">← Back to main page</a></p>
    `);
  }
});

// Webhook endpoint for bot integrations
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  res.status(200).json({ received: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 JS Tools Bot Framework server listening on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);

  // Display network addresses
  const addresses = [];
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    if (interfaces.hasOwnProperty(name)) {
      for (const current of interfaces[name]) {
        if (current.family === 'IPv4' && current.internal === false) {
          addresses.push(current.address);
        }
      }
    }
  }

  if (addresses.length) {
    console.log('\n📍 Other possible addresses:');
    for (const address of addresses) {
      console.log(`   http://${address}:${PORT}`);
    }
  }
});
