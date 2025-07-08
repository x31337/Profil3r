const express = require('express');
const app = express();
const PORT = 3000;

// Simple test server for messenger bot framework
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Messenger Bot Framework Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { color: green; }
        .info { background: #f0f0f0; padding: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Facebook Messenger Bot Framework</h1>
        <p class="status">✅ Server is running</p>
        <div class="info">
          <h3>Framework Information</h3>
          <p>This is a test server for the Facebook Messenger Bot Framework (fbbot).</p>
          <p>The framework provides tools for building Facebook Messenger bots.</p>
          <p>Port: ${PORT}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'messenger-bot-framework', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Messenger Bot Framework test server listening on port ${PORT}`);
});
