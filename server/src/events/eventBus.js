const { EventEmitter } = require('events');

class EventBus {
  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }

  publish(eventType, payload) {
    const envelope = {
      eventType,
      payload,
      timestamp: new Date().toISOString(),
    };
    console.log(`[EventBus] Publishing: ${eventType}`, JSON.stringify(payload).slice(0, 200));
    this.emitter.emit(eventType, envelope);
  }

  subscribe(eventType, handler) {
    this.emitter.on(eventType, async (envelope) => {
      try {
        await handler(envelope);
      } catch (err) {
        console.error(`[EventBus] Handler error for ${eventType}:`, err.message);
      }
    });
  }

  unsubscribe(eventType, handler) {
    this.emitter.removeListener(eventType, handler);
  }
}

module.exports = new EventBus();
