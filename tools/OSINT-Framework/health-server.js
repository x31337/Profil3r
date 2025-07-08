const express = require('express');
const path = require('path');
const app = express();
const PORT = 8000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'osint-framework', port: PORT });
});

// Default route serves the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OSINT Framework server listening on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});
