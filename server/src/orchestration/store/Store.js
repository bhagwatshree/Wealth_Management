const fs = require('fs');
const path = require('path');

class Store {
  constructor(name) {
    this.data = new Map();
    this.filePath = path.join(__dirname, '../../data', `${name}.json`);
    this.load();
  }

  set(id, record) {
    this.data.set(id, { ...record, updatedAt: new Date().toISOString() });
    this.persist();
    return this.data.get(id);
  }

  get(id) {
    return this.data.get(id) || null;
  }

  getAll() {
    return [...this.data.values()];
  }

  find(predicate) {
    return [...this.data.values()].filter(predicate);
  }

  delete(id) {
    const deleted = this.data.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  persist() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const serialized = JSON.stringify([...this.data.entries()], null, 2);
      fs.writeFileSync(this.filePath, serialized, 'utf8');
    } catch (err) {
      console.error(`[Store] Failed to persist:`, err.message);
    }
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const entries = JSON.parse(raw);
        this.data = new Map(entries);
        console.log(`[Store] Loaded ${this.data.size} records from ${path.basename(this.filePath)}`);
      }
    } catch (err) {
      console.error(`[Store] Failed to load:`, err.message);
    }
  }
}

module.exports = Store;
