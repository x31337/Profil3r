const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.subscribers = new Map();
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);
    this.on(eventType, callback);
  }

  unsubscribe(eventType, callback) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).delete(callback);
      this.off(eventType, callback);
    }
  }

  broadcast(eventType, data) {
    console.log(`🔔 Broadcasting event: ${eventType}`, data);
    this.emit(eventType, data);
  }

  // WebSocket broadcast support
  broadcastToWebSocket(wss, eventType, data) {
    if (wss && wss.clients) {
      const message = JSON.stringify({ type: eventType, data });
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(message);
        }
      });
    }
    this.broadcast(eventType, data);
  }

  getSubscribers(eventType) {
    return this.subscribers.get(eventType) || new Set();
  }

  getAllSubscribers() {
    return this.subscribers;
  }
}

module.exports = EventBus;
