import { describe, it, expect, beforeEach, vi } from 'vitest';

const { MockStore } = vi.hoisted(() => {
  class MockStore {
    constructor() {
      this.data = new Map();
    }
    set(id, record) {
      this.data.set(id, { ...record, updatedAt: new Date().toISOString() });
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
      return this.data.delete(id);
    }
  }
  return { MockStore };
});

vi.mock('../src/orchestration/store/Store.js', () => ({
  default: MockStore,
}));

// Suppress console output for cleaner tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

const { screenCustomer, getScreeningResult, getScreeningsByCustomer } = await import('../src/orchestration/services/screeningService.js');

describe('screeningService', () => {
  describe('screenCustomer', () => {
    it('returns PASS for normal names', async () => {
      const result = await screenCustomer('cust-100', {
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result).toBeDefined();
      expect(result.screeningId).toBeDefined();
      expect(result.customerId).toBe('cust-100');
      expect(result.result).toBe('PASS');
      expect(result.riskScore).toBe(12);
      expect(result.details).toBe('No adverse findings');
    });

    it('returns FLAGGED for names containing SANCTION', async () => {
      const result = await screenCustomer('cust-101', {
        firstName: 'SANCTION',
        lastName: 'Person',
      });

      expect(result.result).toBe('FLAGGED');
      expect(result.riskScore).toBe(85);
      expect(result.details).toContain('manual review required');
    });

    it('returns FLAGGED for names containing PEP', async () => {
      const result = await screenCustomer('cust-102', {
        firstName: 'PEP',
        lastName: 'Official',
      });

      expect(result.result).toBe('FLAGGED');
      expect(result.riskScore).toBe(85);
    });

    it('result includes checks breakdown (sanctions, pep, adverseMedia)', async () => {
      const result = await screenCustomer('cust-103', {
        firstName: 'Normal',
        lastName: 'User',
      });

      expect(result.checks).toBeDefined();
      expect(result.checks.sanctions).toBeDefined();
      expect(result.checks.sanctions.result).toBe('CLEAR');
      expect(result.checks.sanctions.source).toBe('MockSanctionsList');

      expect(result.checks.pep).toBeDefined();
      expect(result.checks.pep.result).toBe('CLEAR');
      expect(result.checks.pep.source).toBe('MockPEPDatabase');

      expect(result.checks.adverseMedia).toBeDefined();
      expect(result.checks.adverseMedia.result).toBe('CLEAR');
      expect(result.checks.adverseMedia.source).toBe('MockMediaScan');
    });

    it('checks show HIT for flagged results', async () => {
      const result = await screenCustomer('cust-104', {
        firstName: 'SANCTION',
        lastName: 'Target',
      });

      expect(result.checks.sanctions.result).toBe('HIT');
      expect(result.checks.pep.result).toBe('HIT');
      expect(result.checks.adverseMedia.result).toBe('CLEAR');
    });

    it('riskScore is 85 for flagged and 12 for pass', async () => {
      const passResult = await screenCustomer('cust-105', {
        firstName: 'Clean',
        lastName: 'Name',
      });
      expect(passResult.riskScore).toBe(12);

      const flaggedResult = await screenCustomer('cust-106', {
        firstName: 'SANCTION',
        lastName: 'Match',
      });
      expect(flaggedResult.riskScore).toBe(85);
    });
  });

  describe('getScreeningResult', () => {
    it('returns stored result by screeningId', async () => {
      const created = await screenCustomer('cust-110', {
        firstName: 'Alice',
        lastName: 'Wonder',
      });

      const retrieved = getScreeningResult(created.screeningId);

      expect(retrieved).toBeDefined();
      expect(retrieved.screeningId).toBe(created.screeningId);
      expect(retrieved.customerId).toBe('cust-110');
      expect(retrieved.result).toBe('PASS');
      expect(retrieved.screenedAt).toBeDefined();
    });

    it('returns null for non-existent screeningId', () => {
      const result = getScreeningResult('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getScreeningsByCustomer', () => {
    it('returns all screenings for a customer', async () => {
      const uniqueId = `cust-scrn-${Date.now()}`;
      await screenCustomer(uniqueId, { firstName: 'Bob', lastName: 'One' });
      await screenCustomer(uniqueId, { firstName: 'Bob', lastName: 'Two' });
      await screenCustomer(`${uniqueId}-other`, { firstName: 'Carol', lastName: 'Other' });

      const results = getScreeningsByCustomer(uniqueId);
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r.customerId).toBe(uniqueId);
      });
    });

    it('returns empty array when no screenings exist', () => {
      const results = getScreeningsByCustomer('no-match-ever');
      expect(results).toEqual([]);
    });
  });
});
