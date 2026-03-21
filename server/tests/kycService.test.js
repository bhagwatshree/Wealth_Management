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

// Suppress console.error/log for cleaner test output
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

const { submitKyc, getKycStatus, getKycByCustomer, verifyKyc, KYC_STATUS } = await import('../src/orchestration/services/kycService.js');

describe('kycService', () => {
  describe('submitKyc', () => {
    it('creates a record with PENDING status', async () => {
      const result = await submitKyc('cust-001', { firstName: 'John', lastName: 'Doe' }, 'CUSTOMER');

      expect(result).toBeDefined();
      expect(result.kycId).toBeDefined();
      expect(result.status).toBe('PENDING');
    });

    it('builds correct steps for CUSTOMER role', async () => {
      const result = await submitKyc('cust-002', { firstName: 'Jane' }, 'CUSTOMER');
      const record = getKycStatus(result.kycId);

      expect(record).toBeDefined();
      expect(record.role).toBe('CUSTOMER');
      expect(record.steps).toHaveLength(4);

      const stepNames = record.steps.map((s) => s.name);
      expect(stepNames).toContain('Identity Verification');
      expect(stepNames).toContain('Address Proof');
      expect(stepNames).toContain('Financial Details');
      expect(stepNames).toContain('eKYC');
      record.steps.forEach((step) => {
        expect(step.status).toBe('PENDING');
      });
    });

    it('builds correct steps for FUND_MANAGER role', async () => {
      const result = await submitKyc('fm-001', { orgName: 'FundCo' }, 'FUND_MANAGER');
      const record = getKycStatus(result.kycId);

      expect(record).toBeDefined();
      expect(record.role).toBe('FUND_MANAGER');
      expect(record.steps).toHaveLength(4);

      const stepNames = record.steps.map((s) => s.name);
      expect(stepNames).toContain('Organization Verification');
      expect(stepNames).toContain('Regulatory Compliance');
      expect(stepNames).toContain('Authorized Signatory');
      expect(stepNames).toContain('eKYC');
    });
  });

  describe('getKycStatus', () => {
    it('returns the created record', async () => {
      const { kycId } = await submitKyc('cust-010', { firstName: 'Alice' }, 'CUSTOMER');
      const record = getKycStatus(kycId);

      expect(record).toBeDefined();
      expect(record.kycId).toBe(kycId);
      expect(record.customerId).toBe('cust-010');
      expect(record.status).toBe('PENDING');
      expect(record.data).toEqual({ firstName: 'Alice' });
    });

    it('returns null for non-existent kycId', () => {
      const record = getKycStatus('non-existent-id');
      expect(record).toBeNull();
    });
  });

  describe('getKycByCustomer', () => {
    it('finds records by customerId', async () => {
      // Use unique IDs to avoid interference from other tests
      const uniqueId = `cust-getbyc-${Date.now()}`;
      await submitKyc(uniqueId, { firstName: 'Bob' }, 'CUSTOMER');
      await submitKyc(uniqueId, { firstName: 'Bob' }, 'CUSTOMER');

      const records = getKycByCustomer(uniqueId);
      expect(records).toHaveLength(2);
      records.forEach((r) => {
        expect(r.customerId).toBe(uniqueId);
      });
    });

    it('returns empty array when no records match', () => {
      const records = getKycByCustomer('no-match-ever');
      expect(records).toEqual([]);
    });
  });

  describe('verifyKyc', () => {
    it('APPROVE sets status to VERIFIED', async () => {
      const { kycId } = await submitKyc('cust-030', { firstName: 'Dave', lastName: 'Smith' }, 'CUSTOMER');

      const record = await verifyKyc(kycId, 'APPROVE', 'Looks good');

      expect(record.status).toBe('VERIFIED');
      expect(record.verifiedAt).toBeDefined();
      expect(record.steps.every((s) => s.status === 'COMPLETED')).toBe(true);
    });

    it('REJECT sets status to REJECTED with reason', async () => {
      const { kycId } = await submitKyc('cust-031', { firstName: 'Eve' }, 'CUSTOMER');

      const record = await verifyKyc(kycId, 'REJECT', 'Incomplete documents');

      expect(record.status).toBe('REJECTED');
      expect(record.rejectionReason).toBe('Incomplete documents');
      expect(record.verifiedAt).toBeNull();
    });

    it('throws for non-existent kycId', async () => {
      await expect(verifyKyc('bad-id', 'APPROVE', '')).rejects.toThrow('KYC record bad-id not found');
    });
  });
});
