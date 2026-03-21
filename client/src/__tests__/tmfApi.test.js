import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

import api from '../api/axiosInstance';
import { getTmfApis, tmf620, tmf629, tmf632, tmf681, tmf688 } from '../api/tmfApi';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tmfApi', () => {
  it('getTmfApis calls GET /tmf', async () => {
    await getTmfApis();
    expect(api.get).toHaveBeenCalledWith('/tmf');
  });

  describe('tmf620 - Product Catalog', () => {
    it('getProducts calls GET /tmf/tmf620/productOffering', async () => {
      const params = { limit: 10 };
      await tmf620.getProducts(params);
      expect(api.get).toHaveBeenCalledWith('/tmf/tmf620/productOffering', { params });
    });
  });

  describe('tmf629 - Customer Management', () => {
    it('getCustomers calls GET /tmf/tmf629/customer', async () => {
      const params = { name: 'Jane' };
      await tmf629.getCustomers(params);
      expect(api.get).toHaveBeenCalledWith('/tmf/tmf629/customer', { params });
    });
  });

  describe('tmf632 - Party Management', () => {
    it('createIndividual calls POST /tmf/tmf632/individual', async () => {
      const data = { givenName: 'John', familyName: 'Doe' };
      await tmf632.createIndividual(data);
      expect(api.post).toHaveBeenCalledWith('/tmf/tmf632/individual', data);
    });
  });

  describe('tmf681 - Communication', () => {
    it('getMessages calls GET /tmf/tmf681/communicationMessage', async () => {
      const params = { status: 'sent' };
      await tmf681.getMessages(params);
      expect(api.get).toHaveBeenCalledWith('/tmf/tmf681/communicationMessage', { params });
    });

    it('sendMessage calls POST /tmf/tmf681/communicationMessage/:id/send', async () => {
      const data = { channel: 'sms' };
      await tmf681.sendMessage('msg-1', data);
      expect(api.post).toHaveBeenCalledWith('/tmf/tmf681/communicationMessage/msg-1/send', data);
    });
  });

  describe('tmf688 - Event Management', () => {
    it('getEvents calls GET /tmf/tmf688/event', async () => {
      const params = { type: 'notification' };
      await tmf688.getEvents(params);
      expect(api.get).toHaveBeenCalledWith('/tmf/tmf688/event', { params });
    });

    it('subscribe calls POST /tmf/tmf688/hub', async () => {
      const data = { callback: 'https://example.com/hook', query: 'eventType=create' };
      await tmf688.subscribe(data);
      expect(api.post).toHaveBeenCalledWith('/tmf/tmf688/hub', data);
    });
  });
});
