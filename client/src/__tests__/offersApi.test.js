import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

import api from '../api/axiosInstance';
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  getAllNav,
  triggerNavUpdate,
  getBatchStatus,
  scheduleBatch,
} from '../api/offersApi';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('offersApi', () => {
  it('getProducts calls GET /offers/products with params', async () => {
    const params = { category: 'fund' };
    await getProducts(params);
    expect(api.get).toHaveBeenCalledWith('/offers/products', { params });
  });

  it('createProduct calls POST /offers/products', async () => {
    const data = { name: 'Growth Fund' };
    await createProduct(data);
    expect(api.post).toHaveBeenCalledWith('/offers/products', data);
  });

  it('getProduct calls GET /offers/products/:id', async () => {
    await getProduct('prod-42');
    expect(api.get).toHaveBeenCalledWith('/offers/products/prod-42');
  });

  it('updateProduct calls PUT /offers/products/:id', async () => {
    const data = { name: 'Updated Fund' };
    await updateProduct('prod-42', data);
    expect(api.put).toHaveBeenCalledWith('/offers/products/prod-42', data);
  });

  it('getAllNav calls GET /offers/nav', async () => {
    await getAllNav();
    expect(api.get).toHaveBeenCalledWith('/offers/nav');
  });

  it('triggerNavUpdate calls POST /offers/nav/trigger', async () => {
    await triggerNavUpdate('csv-data', 'standard');
    expect(api.post).toHaveBeenCalledWith('/offers/nav/trigger', {
      csvData: 'csv-data',
      format: 'standard',
    });
  });

  it('getBatchStatus calls GET /offers/batch/status', async () => {
    await getBatchStatus();
    expect(api.get).toHaveBeenCalledWith('/offers/batch/status');
  });

  it('scheduleBatch calls POST /offers/batch/schedule', async () => {
    const data = { jobName: 'nav-update', cron: '0 6 * * *' };
    await scheduleBatch(data);
    expect(api.post).toHaveBeenCalledWith('/offers/batch/schedule', data);
  });
});
