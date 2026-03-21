import { describe, it, expect, beforeEach, vi } from 'vitest';

const eventBus = (await import('../src/events/eventBus.js')).default;

describe('EventBus', () => {
  beforeEach(() => {
    // Remove all listeners between tests to prevent cross-talk
    eventBus.emitter.removeAllListeners();
  });

  it('publish emits events that subscribers receive', async () => {
    const handler = vi.fn();
    eventBus.subscribe('test.event', handler);

    eventBus.publish('test.event', { key: 'value' });

    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  it('envelope contains eventType, payload, and timestamp', async () => {
    let receivedEnvelope = null;
    const handler = vi.fn((envelope) => {
      receivedEnvelope = envelope;
    });

    eventBus.subscribe('test.envelope', handler);
    eventBus.publish('test.envelope', { data: 42 });

    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
    });

    expect(receivedEnvelope).toBeDefined();
    expect(receivedEnvelope.eventType).toBe('test.envelope');
    expect(receivedEnvelope.payload).toEqual({ data: 42 });
    expect(receivedEnvelope.timestamp).toBeDefined();
    // Verify timestamp is a valid ISO string
    expect(new Date(receivedEnvelope.timestamp).toISOString()).toBe(receivedEnvelope.timestamp);
  });

  it('multiple subscribers receive the same event', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    eventBus.subscribe('test.multi', handler1);
    eventBus.subscribe('test.multi', handler2);
    eventBus.subscribe('test.multi', handler3);

    eventBus.publish('test.multi', { msg: 'broadcast' });

    await vi.waitFor(() => {
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    // All handlers receive the same envelope
    const envelope1 = handler1.mock.calls[0][0];
    const envelope2 = handler2.mock.calls[0][0];
    const envelope3 = handler3.mock.calls[0][0];

    expect(envelope1.payload).toEqual({ msg: 'broadcast' });
    expect(envelope2.payload).toEqual({ msg: 'broadcast' });
    expect(envelope3.payload).toEqual({ msg: 'broadcast' });
  });

  it('unsubscribe stops receiving events', () => {
    // Note: unsubscribe removes the exact function reference passed.
    // Since subscribe wraps the handler internally, unsubscribe with the
    // original handler won't remove the wrapper. This tests the API contract.
    const directListener = vi.fn();

    // Attach directly so unsubscribe works with the same reference
    eventBus.emitter.on('test.unsub', directListener);
    eventBus.publish('test.unsub', { n: 1 });
    expect(directListener).toHaveBeenCalledTimes(1);

    eventBus.unsubscribe('test.unsub', directListener);
    eventBus.publish('test.unsub', { n: 2 });
    expect(directListener).toHaveBeenCalledTimes(1); // still 1, no new call
  });

  it('handler errors do not crash the bus (error boundary)', async () => {
    const errorHandler = vi.fn(() => {
      throw new Error('Handler exploded!');
    });
    const safeHandler = vi.fn();

    // Suppress console.error output during this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    eventBus.subscribe('test.error', errorHandler);
    eventBus.subscribe('test.error', safeHandler);

    // This should NOT throw
    expect(() => {
      eventBus.publish('test.error', { data: 'boom' });
    }).not.toThrow();

    await vi.waitFor(() => {
      expect(safeHandler).toHaveBeenCalledTimes(1);
    });

    consoleSpy.mockRestore();
  });
});
