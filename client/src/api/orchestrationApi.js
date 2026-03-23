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

// --- Account ---
export const getAccountStatus = (customerId) => api.get(`/dxl/account/${customerId}`).then(r => r.data);

// --- Onboarding ---
export const startOnboarding = (data) => api.post('/dxl/onboard', data).then(r => r.data);

// --- Workflows ---
export const getWorkflows = () => api.get('/dxl/workflows');
export const getWorkflow = (id) => api.get(`/dxl/workflows/${id}`);

// --- Applications ---
export const submitApplication = (data) => api.post('/dxl/applications', data).then(r => r.data);
export const getMyApplications = (customerId) => api.get(`/dxl/applications/customer/${customerId}`).then(r => r.data);
export const getAllApplications = (params) => api.get('/dxl/applications', { params }).then(r => r.data);
export const getApplicationStats = () => api.get('/dxl/applications/stats').then(r => r.data);
export const getApplicationById = (id) => api.get(`/dxl/applications/${id}`).then(r => r.data);
export const reviewApplication = (id, data) => api.post(`/dxl/applications/${id}/review`, data).then(r => r.data);

// --- Transactions ---
export const makePayment = (data) => api.post('/dxl/transactions/pay', data).then(r => r.data);
export const getMyTransactions = (customerId, params) => api.get(`/dxl/transactions/customer/${customerId}`, { params }).then(r => r.data);
export const getMyBalance = (customerId, accountId) => api.get(`/dxl/transactions/balance/${customerId}`, { params: { accountId } }).then(r => r.data);
export const getAllTransactions = (params) => api.get('/dxl/transactions', { params }).then(r => r.data);
export const getLedgerSummary = () => api.get('/dxl/transactions/ledger/summary').then(r => r.data);
export const postInterest = (data) => api.post('/dxl/transactions/interest', data).then(r => r.data);
