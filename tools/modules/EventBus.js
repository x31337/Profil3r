const EventEmitter = require('events');

/**
 * EventBus - Central event management system for the modular architecture
 *
 * This class provides a centralized event management system that supports
 * the modular architecture by enabling communication between different
 * modules through events. It extends Node.js EventEmitter to provide
 * additional functionality for subscriber management and WebSocket broadcasting.
 *
 * @class EventBus
 * @extends EventEmitter
 * @example
 * const EventBus = require('./EventBus');
 * const eventBus = new EventBus();
 *
 * // Subscribe to events
 * eventBus.subscribe('user_login', (data) => {
 *   console.log('User logged in:', data);
 * });
 *
 * // Broadcast events
 * eventBus.broadcast('user_login', { userId: 123, timestamp: Date.now() });
 */
class EventBus extends EventEmitter {
  /**
   * Creates a new EventBus instance
   * @constructor
   */
  constructor() {
    super();
    /**
     * Map of event types to their subscribers
     * @type {Map<string, Set<Function>>}
     * @private
     */
    this.subscribers = new Map();
  }

  /**
   * Subscribe to an event type with a callback function
   *
   * @param {string} eventType - The type of event to subscribe to
   * @param {Function} callback - The callback function to execute when the event is triggered
   * @example
   * eventBus.subscribe('osint_search_complete', (data) => {
   *   console.log('OSINT search completed:', data.results);
   * });
   */
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);
    this.on(eventType, callback);
  }

  /**
   * Unsubscribe from an event type
   *
   * @param {string} eventType - The type of event to unsubscribe from
   * @param {Function} callback - The callback function to remove
   * @example
   * eventBus.unsubscribe('osint_search_complete', myCallback);
   */
  unsubscribe(eventType, callback) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).delete(callback);
      this.off(eventType, callback);
    }
  }

  /**
   * Broadcast an event to all subscribers
   *
   * @param {string} eventType - The type of event to broadcast
   * @param {*} data - The data to send with the event
   * @example
   * eventBus.broadcast('auth_success', {
   *   userId: 123,
   *   timestamp: Date.now(),
   *   module: 'facebook_automation'
   * });
   */
  broadcast(eventType, data) {
    console.log(`🔔 Broadcasting event: ${eventType}`, data);
    this.emit(eventType, data);
  }

  /**
   * Broadcast an event to WebSocket clients and regular subscribers
   *
   * This method extends the standard broadcast functionality to include
   * WebSocket clients, enabling real-time communication in web interfaces.
   *
   * @param {WebSocket.Server} wss - WebSocket server instance
   * @param {string} eventType - The type of event to broadcast
   * @param {*} data - The data to send with the event
   * @example
   * eventBus.broadcastToWebSocket(wss, 'profile_found', {
   *   platform: 'facebook',
   *   profileUrl: 'https://facebook.com/user123',
   *   timestamp: Date.now()
   * });
   */
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

  /**
   * Get all subscribers for a specific event type
   *
   * @param {string} eventType - The event type to get subscribers for
   * @returns {Set<Function>} Set of callback functions subscribed to the event
   */
  getSubscribers(eventType) {
    return this.subscribers.get(eventType) || new Set();
  }

  /**
   * Get all subscribers for all event types
   *
   * @returns {Map<string, Set<Function>>} Map of all event types and their subscribers
   */
  getAllSubscribers() {
    return this.subscribers;
  }
}

module.exports = EventBus;
