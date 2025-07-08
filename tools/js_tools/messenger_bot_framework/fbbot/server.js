// server.js
// Simple Express server for the Node.js service

const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Node.js Express!',
    service: 'profil3r-node', 
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'profil3r-node',
    timestamp: new Date().toISOString()
  });
});

app.get('/info', (req, res) => {
  res.json({
    node_version: process.version,
    service: 'profil3r-node',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Node.js service listening on port ${port}`);
});
