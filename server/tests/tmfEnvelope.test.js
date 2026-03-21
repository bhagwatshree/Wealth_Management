import { describe, it, expect, vi } from 'vitest';

const { toTmfResource, toTmfCollection, sendTmfCollection, BASE_PATH } = await import('../src/integration/tmf/common/tmfEnvelope.js');

describe('tmfEnvelope', () => {
  describe('toTmfResource', () => {
    it('adds id, href, @type, @baseType, @schemaLocation', () => {
      const entity = { id: 'prod-001', name: 'Test Product', status: 'ACTIVE' };
      const result = toTmfResource(entity, {
        type: 'ProductOffering',
        basePath: '/productCatalogManagement/v4/productOffering',
      });

      expect(result.id).toBe('prod-001');
      expect(result.href).toBe(`${BASE_PATH}/productCatalogManagement/v4/productOffering/prod-001`);
      expect(result['@type']).toBe('ProductOffering');
      expect(result['@baseType']).toBe('ProductOffering');
      expect(result['@schemaLocation']).toBe(`${BASE_PATH}/schema/ProductOffering.json`);
      // Original fields preserved
      expect(result.name).toBe('Test Product');
      expect(result.status).toBe('ACTIVE');
    });

    it('builds correct href from basePath', () => {
      const entity = { productId: 'p-123', name: 'Fund' };
      const result = toTmfResource(entity, {
        type: 'Product',
        basePath: '/product/v1/items',
      });

      expect(result.id).toBe('p-123');
      expect(result.href).toBe(`${BASE_PATH}/product/v1/items/p-123`);
    });

    it('uses baseType when provided separately from type', () => {
      const entity = { id: 'x-1' };
      const result = toTmfResource(entity, {
        type: 'SpecificType',
        baseType: 'BaseType',
        basePath: '/test',
      });

      expect(result['@type']).toBe('SpecificType');
      expect(result['@baseType']).toBe('BaseType');
    });

    it('uses custom schemaLocation when provided', () => {
      const entity = { id: 'x-2' };
      const result = toTmfResource(entity, {
        type: 'Custom',
        basePath: '/test',
        schemaLocation: 'https://example.com/schema/Custom.json',
      });

      expect(result['@schemaLocation']).toBe('https://example.com/schema/Custom.json');
    });

    it('resolves id from alternative id fields (profileId, kycId, etc.)', () => {
      const profileEntity = { profileId: 'prof-001', name: 'Customer' };
      const result = toTmfResource(profileEntity, { type: 'Party', basePath: '/party' });
      expect(result.id).toBe('prof-001');

      const kycEntity = { kycId: 'kyc-001' };
      const kycResult = toTmfResource(kycEntity, { type: 'KYC', basePath: '/kyc' });
      expect(kycResult.id).toBe('kyc-001');
    });
  });

  describe('toTmfCollection', () => {
    const entities = Array.from({ length: 25 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i}`,
      status: 'ACTIVE',
    }));

    it('paginates with offset and limit from req.query', () => {
      const mockReq = {
        query: { offset: '5', limit: '10' },
        protocol: 'https',
        get: () => 'localhost:4000',
      };

      const result = toTmfCollection(entities, {
        type: 'Product',
        basePath: '/products',
        req: mockReq,
      });

      expect(result.total).toBe(25);
      expect(result.offset).toBe(5);
      expect(result.limit).toBe(10);
      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe('item-5');
      expect(result.items[9].id).toBe('item-14');
    });

    it('uses default offset 0 and limit 20', () => {
      const mockReq = {
        query: {},
        protocol: 'https',
        get: () => 'localhost:4000',
      };

      const result = toTmfCollection(entities, {
        type: 'Product',
        basePath: '/products',
        req: mockReq,
      });

      expect(result.offset).toBe(0);
      expect(result.limit).toBe(20);
      expect(result.items).toHaveLength(20);
    });

    it('applies field filtering from req.query.fields', () => {
      const mockReq = {
        query: { offset: '0', limit: '5', fields: 'name,status' },
        protocol: 'https',
        get: () => 'localhost:4000',
      };

      const result = toTmfCollection(entities, {
        type: 'Product',
        basePath: '/products',
        req: mockReq,
      });

      expect(result.items).toHaveLength(5);
      result.items.forEach((item) => {
        // Required fields always included
        expect(item.id).toBeDefined();
        expect(item['@type']).toBeDefined();
        // Requested fields included
        expect(item.name).toBeDefined();
        expect(item.status).toBeDefined();
      });
    });

    it('wraps each entity in TMF resource envelope', () => {
      const mockReq = {
        query: { offset: '0', limit: '2' },
        protocol: 'https',
        get: () => 'localhost:4000',
      };

      const result = toTmfCollection(entities, {
        type: 'Product',
        basePath: '/products',
        req: mockReq,
      });

      result.items.forEach((item) => {
        expect(item['@type']).toBe('Product');
        expect(item.href).toContain(BASE_PATH);
      });
    });
  });

  describe('sendTmfCollection', () => {
    it('sets X-Total-Count and X-Result-Count headers', () => {
      const mockReq = {
        query: { offset: '0', limit: '10' },
        protocol: 'https',
        get: () => 'localhost:4000',
      };
      const mockRes = { set: vi.fn(), json: vi.fn() };

      const entities = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
        { id: '3', name: 'C' },
      ];

      const collectionResult = toTmfCollection(entities, {
        type: 'Product',
        basePath: '/products',
        req: mockReq,
      });

      sendTmfCollection(mockRes, collectionResult);

      expect(mockRes.set).toHaveBeenCalledWith('X-Total-Count', '3');
      expect(mockRes.set).toHaveBeenCalledWith('X-Result-Count', '3');
      expect(mockRes.json).toHaveBeenCalledWith(collectionResult.items);
    });

    it('sets Link header when links are present', () => {
      const mockReq = {
        query: { offset: '0', limit: '2' },
        protocol: 'https',
        get: () => 'localhost:4000',
      };
      const mockRes = { set: vi.fn(), json: vi.fn() };

      const entities = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
        { id: '3', name: 'C' },
      ];

      const collectionResult = toTmfCollection(entities, {
        type: 'Product',
        basePath: '/products',
        req: mockReq,
      });

      sendTmfCollection(mockRes, collectionResult);

      // Should have Link header with first/next/last
      expect(mockRes.set).toHaveBeenCalledWith('Link', expect.stringContaining('rel="first"'));
    });
  });
});
