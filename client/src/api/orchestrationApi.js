import api from './axiosInstance';

// --- KYC ---
export const submitKyc = (data) => api.post('/dxl/kyc/submit', data);
export const getKycStatus = (id) => api.get(`/dxl/kyc/${id}/status`);
export const getKycByCustomer = (customerId) => api.get(`/dxl/kyc/customer/${customerId}`);
export const verifyKyc = (id, decision, notes) => api.post(`/dxl/kyc/${id}/verify`, { decision, notes });

// --- Screening ---
export const screenCustomer = (data) => api.post('/dxl/screening/check', data);
export const getScreeningResult = (id) => api.get(`/dxl/screening/${id}`);
export const getScreeningsByCustomer = (customerId) => api.get(`/dxl/screening/customer/${customerId}`);

// --- CRM ---
export const createCustomerProfile = (data) => api.post('/dxl/crm/customers', data);
export const getCustomer360 = (id) => api.get(`/dxl/crm/customers/${id}`);
export const searchCustomers = (params) => api.get('/dxl/crm/customers', { params });
export const updateLifecycle = (id, status) => api.put(`/dxl/crm/customers/${id}/lifecycle`, { status });

// --- CVM Campaigns ---
export const getCampaigns = () => api.get('/dxl/cvm/campaigns');
export const createCampaign = (data) => api.post('/dxl/cvm/campaigns', data);
export const getCampaign = (id) => api.get(`/dxl/cvm/campaigns/${id}`);
export const triggerCampaign = (id, customerIds) => api.post(`/dxl/cvm/campaigns/${id}/trigger`, { customerIds });
export const updateCampaignStatus = (id, status) => api.put(`/dxl/cvm/campaigns/${id}/status`, { status });
export const getCampaignTargeting = (id) => api.get(`/dxl/cvm/campaigns/${id}/targeting`);

// --- Onboarding ---
export const startOnboarding = (data) => api.post('/dxl/onboard', data);

// --- Workflows ---
export const getWorkflows = () => api.get('/dxl/workflows');
export const getWorkflow = (id) => api.get(`/dxl/workflows/${id}`);
