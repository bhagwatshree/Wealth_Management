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
  submitKyc,
  getKycStatus,
  verifyKyc,
  screenCustomer,
  searchCustomers,
  getCampaigns,
  createCampaign,
  triggerCampaign,
  startOnboarding,
  getWorkflows,
} from '../api/orchestrationApi';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('orchestrationApi', () => {
  it('submitKyc calls POST /dxl/kyc/submit', async () => {
    const data = { name: 'John' };
    await submitKyc(data);
    expect(api.post).toHaveBeenCalledWith('/dxl/kyc/submit', data);
  });

  it('getKycStatus calls GET /dxl/kyc/:id/status', async () => {
    await getKycStatus('abc-123');
    expect(api.get).toHaveBeenCalledWith('/dxl/kyc/abc-123/status');
  });

  it('verifyKyc calls POST /dxl/kyc/:id/verify with correct body', async () => {
    await verifyKyc('kyc-1', 'approved', 'Looks good');
    expect(api.post).toHaveBeenCalledWith('/dxl/kyc/kyc-1/verify', {
      decision: 'approved',
      notes: 'Looks good',
    });
  });

  it('screenCustomer calls POST /dxl/screening/check', async () => {
    const data = { customerId: 'c1' };
    await screenCustomer(data);
    expect(api.post).toHaveBeenCalledWith('/dxl/screening/check', data);
  });

  it('searchCustomers calls GET /dxl/crm/customers with params', async () => {
    const params = { name: 'Jane' };
    await searchCustomers(params);
    expect(api.get).toHaveBeenCalledWith('/dxl/crm/customers', { params });
  });

  it('getCampaigns calls GET /dxl/cvm/campaigns', async () => {
    await getCampaigns();
    expect(api.get).toHaveBeenCalledWith('/dxl/cvm/campaigns');
  });

  it('createCampaign calls POST /dxl/cvm/campaigns', async () => {
    const data = { name: 'Summer promo' };
    await createCampaign(data);
    expect(api.post).toHaveBeenCalledWith('/dxl/cvm/campaigns', data);
  });

  it('triggerCampaign calls POST /dxl/cvm/campaigns/:id/trigger', async () => {
    await triggerCampaign('camp-1', ['c1', 'c2']);
    expect(api.post).toHaveBeenCalledWith('/dxl/cvm/campaigns/camp-1/trigger', {
      customerIds: ['c1', 'c2'],
    });
  });

  it('startOnboarding calls POST /dxl/onboard', async () => {
    const data = { step: 'init' };
    await startOnboarding(data);
    expect(api.post).toHaveBeenCalledWith('/dxl/onboard', data);
  });

  it('getWorkflows calls GET /dxl/workflows', async () => {
    await getWorkflows();
    expect(api.get).toHaveBeenCalledWith('/dxl/workflows');
  });
});
