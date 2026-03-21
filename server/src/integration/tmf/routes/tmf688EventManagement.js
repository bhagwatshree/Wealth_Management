/**
 * TMF688 — Event Management
 *
 * Standardized API for subscribing to and querying platform events.
 * Maps to: events/eventBus + events/eventTypes
 *
 * Resources:
 *   Event              — a platform event that has occurred
 *   EventSubscription  — a registration to receive events (hub pattern)
 *
 * Endpoints:
 *   GET    /event                   — query recent events
 *   GET    /event/:id               — retrieve specific event
 *   POST   /hub                     — register event subscription (webhook)
 *   GET    /hub                     — list subscriptions
 *   DELETE /hub/:id                 — unsubscribe
 */

const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { toTmfCollection, sendTmfCollection } = require('../common/tmfEnvelope');
const { tmfErrors } = require('../common/tmfError');
const { requireFields } = require('../common/tmfValidator');
const eventBus = require('../../../events/eventBus');
const eventTypes = require('../../../events/eventTypes');
const Store = require('../../../orchestration/store/Store');

const eventLog = new Store('eventLog');
const subscriptionStore = new Store('eventSubscriptions');

const TMF_TYPE = 'Event';
const BASE = '/tmf688/event';
const HUB_BASE = '/tmf688/hub';

// Capture all events into the log for query
Object.values(eventTypes).forEach((eventType) => {
  eventBus.subscribe(eventType, ({ payload, timestamp }) => {
    const eventId = uuidv4();
    eventLog.set(eventId, {
      id: eventId,
      eventType,
      eventTime: timestamp,
      event: payload,
      '@type': 'Event',
    });

    // Notify webhook subscribers
    const subs = subscriptionStore.find((s) => s.eventType === eventType || s.eventType === '*');
    for (const sub of subs) {
      notifySubscriber(sub, { id: eventId, eventType, eventTime: timestamp, event: payload });
    }
  });
});

async function notifySubscriber(subscription, eventData) {
  if (!subscription.callback) return;
  try {
    const axios = require('axios');
    await axios.post(subscription.callback, eventData, { timeout: 5000 });
  } catch (err) {
    console.error(`[TMF688] Webhook delivery failed for ${subscription.id}:`, err.message);
  }
}

// -- Routes --

// GET /event — query events
router.get('/event', (req, res, next) => {
  try {
    let events = eventLog.getAll();

    // Filter by eventType
    if (req.query.eventType) {
      events = events.filter((e) => e.eventType === req.query.eventType);
    }

    // Filter by time range
    if (req.query.fromDate) {
      const from = new Date(req.query.fromDate).toISOString();
      events = events.filter((e) => e.eventTime >= from);
    }
    if (req.query.toDate) {
      const to = new Date(req.query.toDate).toISOString();
      events = events.filter((e) => e.eventTime <= to);
    }

    // Sort by time descending (most recent first)
    events.sort((a, b) => b.eventTime.localeCompare(a.eventTime));

    const collection = toTmfCollection(events, {
      type: TMF_TYPE,
      basePath: BASE,
      req,
    });
    sendTmfCollection(res, collection);
  } catch (e) { next(e); }
});

// GET /event/:id
router.get('/event/:id', (req, res, next) => {
  try {
    const event = eventLog.get(req.params.id);
    if (!event) throw tmfErrors.notFound('Event', req.params.id);
    res.json(event);
  } catch (e) { next(e); }
});

// GET /eventType — list available event types
router.get('/eventType', (req, res) => {
  const types = Object.entries(eventTypes).map(([key, value]) => ({
    id: value,
    name: key,
    '@type': 'EventType',
  }));
  res.json(types);
});

// -- Hub (Webhook Subscriptions) --

// POST /hub — subscribe to events
router.post('/hub', (req, res, next) => {
  try {
    requireFields(req.body, ['callback']);
    const subId = uuidv4();
    const subscription = {
      id: subId,
      callback: req.body.callback,
      query: req.body.query || null,
      eventType: req.body.eventType || '*',
      '@type': 'EventSubscription',
      createdAt: new Date().toISOString(),
    };
    subscriptionStore.set(subId, subscription);
    res.status(201).json(subscription);
  } catch (e) { next(e); }
});

// GET /hub — list subscriptions
router.get('/hub', (req, res, next) => {
  try {
    const subs = subscriptionStore.getAll();
    const collection = toTmfCollection(subs, {
      type: 'EventSubscription',
      basePath: HUB_BASE,
      req,
    });
    sendTmfCollection(res, collection);
  } catch (e) { next(e); }
});

// GET /hub/:id
router.get('/hub/:id', (req, res, next) => {
  try {
    const sub = subscriptionStore.get(req.params.id);
    if (!sub) throw tmfErrors.notFound('EventSubscription', req.params.id);
    res.json(sub);
  } catch (e) { next(e); }
});

// DELETE /hub/:id — unsubscribe
router.delete('/hub/:id', (req, res, next) => {
  try {
    const deleted = subscriptionStore.delete(req.params.id);
    if (!deleted) throw tmfErrors.notFound('EventSubscription', req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
