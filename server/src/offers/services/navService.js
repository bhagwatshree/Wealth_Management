const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const navStore = require('../store/navStore');
const productStore = require('../store/productStore');
const navFileParser = require('../parsers/navFileParser');
const Store = require('../../orchestration/store/Store');

const batchStore = new Store('batches');

async function processNavFile(fileBuffer, format = 'csv') {
  const batchId = uuidv4();
  const batch = {
    batchId,
    type: 'NAV_UPDATE',
    status: 'RUNNING',
    source: 'MANUAL',
    startedAt: new Date().toISOString(),
    completedAt: null,
    recordsProcessed: 0,
    errors: [],
  };
  batchStore.set(batchId, batch);
  eventBus.publish(events.NAV_BATCH_STARTED, { batchId });

  try {
    const records = navFileParser.parse(fileBuffer, format);
    let processed = 0;

    for (const record of records) {
      try {
        const navEntry = {
          fundCode: record.fundCode,
          fundName: record.fundName,
          navDate: record.navDate,
          navValue: record.navValue,
          units: record.units,
          aum: record.aum,
          currency: record.currency,
          updatedAt: new Date().toISOString(),
        };

        // Store NAV by fundCode — latest value
        const existing = navStore.get(record.fundCode);
        const history = existing?.history || [];
        history.push({ navDate: record.navDate, navValue: record.navValue, aum: record.aum });

        navStore.set(record.fundCode, {
          ...navEntry,
          history: history.slice(-365), // Keep last 365 entries
        });

        // Update linked products
        const products = productStore.find((p) => p.navEnabled && p.metadata?.fundCode === record.fundCode);
        for (const product of products) {
          product.metadata.latestNav = record.navValue;
          product.metadata.navDate = record.navDate;
          productStore.set(product.productId, product);
        }

        processed++;
      } catch (err) {
        batch.errors.push({ fundCode: record.fundCode, error: err.message });
      }
    }

    batch.status = 'COMPLETED';
    batch.recordsProcessed = processed;
    batch.completedAt = new Date().toISOString();
    batchStore.set(batchId, batch);
    eventBus.publish(events.NAV_BATCH_COMPLETED, { batchId, recordsProcessed: processed });

    return batch;
  } catch (err) {
    batch.status = 'FAILED';
    batch.errors.push({ error: err.message });
    batch.completedAt = new Date().toISOString();
    batchStore.set(batchId, batch);
    eventBus.publish(events.NAV_BATCH_FAILED, { batchId, error: err.message });
    throw err;
  }
}

function getLatestNav(fundCode) {
  const entry = navStore.get(fundCode);
  if (!entry) return null;
  const { history, ...latest } = entry;
  return latest;
}

function getNavHistory(fundCode, limit = 30) {
  const entry = navStore.get(fundCode);
  if (!entry) return null;
  return {
    fundCode: entry.fundCode,
    fundName: entry.fundName,
    currency: entry.currency,
    history: (entry.history || []).slice(-limit),
  };
}

function getAllNav() {
  return navStore.getAll().map(({ history, ...latest }) => latest);
}

function getBatchStatus(batchId) {
  return batchStore.get(batchId);
}

function getAllBatches() {
  return batchStore.getAll();
}

module.exports = { processNavFile, getLatestNav, getNavHistory, getAllNav, getBatchStatus, getAllBatches };
