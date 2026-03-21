import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Suppress console output for cleaner tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Use createRequire to get the same CJS module instances as the source code
const productStore = require('../src/offers/store/productStore');
const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  CATEGORIES,
  PRODUCT_TYPES,
} = require('../src/offers/services/productCatalogService');

describe('productCatalogService', () => {
  beforeEach(() => {
    productStore.data.clear();
  });

  describe('createProduct', () => {
    it('creates a product with default values', () => {
      const product = createProduct({ name: 'Test Fund' });

      expect(product).toBeDefined();
      expect(product.productId).toBeDefined();
      expect(product.name).toBe('Test Fund');
      expect(product.category).toBe('SAVINGS');
      expect(product.type).toBe('FIXED_DEPOSIT');
      expect(product.currency).toBe('KES');
      expect(product.minInvestment).toBe(0);
      expect(product.maxInvestment).toBeNull();
      expect(product.riskLevel).toBe('MEDIUM');
      expect(product.navEnabled).toBe(false);
      expect(product.status).toBe('ACTIVE');
      expect(product.metadata).toEqual({});
      expect(product.createdAt).toBeDefined();
    });

    it('creates a product with provided values', () => {
      const product = createProduct({
        name: 'Money Market Fund',
        shortName: 'MMF',
        category: 'INVESTMENT_FUNDS',
        type: 'MONEY_MARKET_FUND',
        currency: 'USD',
        minInvestment: 1000,
        maxInvestment: 1000000,
        expectedReturn: 8.5,
        riskLevel: 'LOW',
        navEnabled: true,
        fundManagerId: 'fm-001',
        fundManagerName: 'Capital Corp',
        status: 'ACTIVE',
      });

      expect(product.name).toBe('Money Market Fund');
      expect(product.shortName).toBe('MMF');
      expect(product.category).toBe('INVESTMENT_FUNDS');
      expect(product.type).toBe('MONEY_MARKET_FUND');
      expect(product.currency).toBe('USD');
      expect(product.minInvestment).toBe(1000);
      expect(product.maxInvestment).toBe(1000000);
      expect(product.expectedReturn).toBe(8.5);
      expect(product.riskLevel).toBe('LOW');
      expect(product.navEnabled).toBe(true);
      expect(product.fundManagerId).toBe('fm-001');
    });
  });

  describe('getProduct', () => {
    it('returns created product by id', () => {
      const created = createProduct({ name: 'Retrieve Me' });
      const retrieved = getProduct(created.productId);

      expect(retrieved).toBeDefined();
      expect(retrieved.productId).toBe(created.productId);
      expect(retrieved.name).toBe('Retrieve Me');
    });

    it('returns null for non-existent productId', () => {
      const result = getProduct('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getAllProducts', () => {
    beforeEach(() => {
      createProduct({ name: 'Fund A', category: 'EQUITIES', type: 'STOCK_TRADING', status: 'ACTIVE' });
      createProduct({ name: 'Fund B', category: 'FIXED_INCOME', type: 'TREASURY_BONDS', status: 'ACTIVE' });
      createProduct({ name: 'Fund C', category: 'EQUITIES', type: 'STOCK_TRADING', status: 'INACTIVE' });
      createProduct({ name: 'Fund D', category: 'SAVINGS', type: 'FIXED_DEPOSIT', status: 'ACTIVE' });
    });

    it('returns all products when no filters', () => {
      const results = getAllProducts();
      expect(results).toHaveLength(4);
    });

    it('filters by category', () => {
      const results = getAllProducts({ category: 'EQUITIES' });
      expect(results).toHaveLength(2);
      results.forEach((p) => {
        expect(p.category).toBe('EQUITIES');
      });
    });

    it('filters by type', () => {
      const results = getAllProducts({ type: 'TREASURY_BONDS' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Fund B');
    });

    it('filters by status', () => {
      const results = getAllProducts({ status: 'INACTIVE' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Fund C');
    });

    it('combines multiple filters', () => {
      const results = getAllProducts({ category: 'EQUITIES', status: 'ACTIVE' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Fund A');
    });
  });

  describe('updateProduct', () => {
    it('modifies fields on existing product', () => {
      const created = createProduct({ name: 'Original', riskLevel: 'LOW' });

      const updated = updateProduct(created.productId, {
        name: 'Updated Name',
        riskLevel: 'HIGH',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.riskLevel).toBe('HIGH');
      expect(updated.productId).toBe(created.productId);
      expect(updated.createdAt).toBe(created.createdAt);
    });

    it('throws for non-existent productId', () => {
      expect(() => updateProduct('bad-id', { name: 'X' })).toThrow('Product bad-id not found');
    });
  });

  describe('constants', () => {
    it('CATEGORIES is exported as an array', () => {
      expect(Array.isArray(CATEGORIES)).toBe(true);
      expect(CATEGORIES.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain('EQUITIES');
      expect(CATEGORIES).toContain('FIXED_INCOME');
      expect(CATEGORIES).toContain('SAVINGS');
    });

    it('PRODUCT_TYPES is exported as an array', () => {
      expect(Array.isArray(PRODUCT_TYPES)).toBe(true);
      expect(PRODUCT_TYPES.length).toBeGreaterThan(0);
      expect(PRODUCT_TYPES).toContain('MONEY_MARKET_FUND');
      expect(PRODUCT_TYPES).toContain('TREASURY_BONDS');
      expect(PRODUCT_TYPES).toContain('FIXED_DEPOSIT');
    });
  });
});
