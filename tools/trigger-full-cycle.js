const WebSocket = require('ws');

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:9001');

ws.on('open', function open() {
  console.log('🔗 Connected to WebSocket server');

  // Send full-cycle command
  ws.send(
    JSON.stringify({
      type: 'full-cycle',
      data: {}
    })
  );

  console.log('🚀 Full auto-cycle triggered!');
});

ws.on('message', function message(data) {
  const msg = JSON.parse(data);
  console.log('📡 Received:', msg.type, msg.data);

  // Close connection after receiving full-cycle completion
  if (msg.type === 'full-cycle-completed' || msg.type === 'full-cycle-failed') {
    console.log('🏁 Full cycle completed');
    ws.close();
  }
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
  process.exit(0);
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
  process.exit(1);
});
