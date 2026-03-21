import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Suppress console output for cleaner tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Use createRequire to get the same CJS module instances as the source code
const customerStore = require('../src/orchestration/store/customerStore');
const {
  createCustomerProfile,
  getCustomer360,
  updateLifecycleStatus,
  searchCustomers,
  LIFECYCLE,
} = require('../src/orchestration/services/crmService');

describe('crmService', () => {
  beforeEach(() => {
    customerStore.data.clear();
  });

  describe('createCustomerProfile', () => {
    it('creates profile with ACTIVE lifecycle', async () => {
      const profile = await createCustomerProfile('cust-200', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobileNo: '+254700000000',
      });

      expect(profile).toBeDefined();
      expect(profile.profileId).toBe('cust-200');
      expect(profile.customerId).toBe('cust-200');
      expect(profile.lifecycleStatus).toBe('ACTIVE');
      expect(profile.personalInfo.firstName).toBe('John');
      expect(profile.personalInfo.lastName).toBe('Doe');
      expect(profile.personalInfo.email).toBe('john@example.com');
      expect(profile.segment).toBe('STANDARD');
    });

    it('sets default values for missing enrichment fields', async () => {
      const profile = await createCustomerProfile('cust-201', {});

      expect(profile.personalInfo.firstName).toBe('');
      expect(profile.personalInfo.lastName).toBe('');
      expect(profile.personalInfo.email).toBe('');
      expect(profile.tags).toEqual([]);
      expect(profile.segment).toBe('STANDARD');
      expect(profile.kyc).toBeNull();
      expect(profile.screening).toBeNull();
      expect(profile.fineractClientId).toBeNull();
    });
  });

  describe('getCustomer360', () => {
    it('returns profile with enrichment data', async () => {
      await createCustomerProfile('cust-210', {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        segment: 'PREMIUM',
      });

      const profile = await getCustomer360('cust-210');

      expect(profile).toBeDefined();
      expect(profile.personalInfo.firstName).toBe('Alice');
      expect(profile.segment).toBe('PREMIUM');
    });

    it('returns null for non-existent customer', async () => {
      const profile = await getCustomer360('non-existent');
      expect(profile).toBeNull();
    });
  });

  describe('updateLifecycleStatus', () => {
    it('changes lifecycle status', async () => {
      await createCustomerProfile('cust-220', { firstName: 'Bob' });

      const updated = updateLifecycleStatus('cust-220', LIFECYCLE.DORMANT);

      expect(updated.lifecycleStatus).toBe('DORMANT');
    });

    it('throws for non-existent customer', () => {
      expect(() => updateLifecycleStatus('bad-id', 'ACTIVE')).toThrow('Customer bad-id not found');
    });
  });

  describe('searchCustomers', () => {
    beforeEach(async () => {
      await createCustomerProfile('cust-230', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        segment: 'PREMIUM',
      });
      await createCustomerProfile('cust-231', {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        segment: 'STANDARD',
      });
      await createCustomerProfile('cust-232', {
        firstName: 'Bob',
        lastName: 'Builder',
        email: 'bob@example.com',
        segment: 'PREMIUM',
      });
      updateLifecycleStatus('cust-232', LIFECYCLE.DORMANT);
    });

    it('filters by lifecycleStatus', () => {
      const results = searchCustomers({ lifecycleStatus: 'ACTIVE' });
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r.lifecycleStatus).toBe('ACTIVE');
      });
    });

    it('filters by segment', () => {
      const results = searchCustomers({ segment: 'PREMIUM' });
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r.segment).toBe('PREMIUM');
      });
    });

    it('filters by search term (name match)', () => {
      const results = searchCustomers({ search: 'john' });
      expect(results).toHaveLength(1);
      expect(results[0].personalInfo.firstName).toBe('John');
    });

    it('filters by search term (email match)', () => {
      const results = searchCustomers({ search: 'jane@' });
      expect(results).toHaveLength(1);
      expect(results[0].personalInfo.firstName).toBe('Jane');
    });

    it('returns all customers when no filters provided', () => {
      const results = searchCustomers({});
      expect(results).toHaveLength(3);
    });

    it('combines multiple filters', () => {
      const results = searchCustomers({ lifecycleStatus: 'ACTIVE', segment: 'PREMIUM' });
      expect(results).toHaveLength(1);
      expect(results[0].personalInfo.firstName).toBe('John');
    });
  });
});
