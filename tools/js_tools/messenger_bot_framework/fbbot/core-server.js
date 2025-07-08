// core-server.js
// Simple Express server for the Core service

const express = require('express');
const app = express();
const port = 8000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Core Service!',
    service: 'profil3r-core', 
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'profil3r-core',
    timestamp: new Date().toISOString()
  });
});

app.get('/info', (req, res) => {
  res.json({
    node_version: process.version,
    service: 'profil3r-core',
    environment: process.env.ENV || 'development',
    uptime: process.uptime()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Core service listening on port ${port}`);
});
