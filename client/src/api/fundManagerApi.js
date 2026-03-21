import api from './axiosInstance';

// Loan Products
export const getLoanProducts = () => api.get('/loan-products').then(r => r.data);
export const getLoanProduct = (id) => api.get(`/loan-products/${id}`).then(r => r.data);
export const createLoanProduct = (data) => api.post('/loan-products', data).then(r => r.data);
export const updateLoanProduct = (id, data) => api.put(`/loan-products/${id}`, data).then(r => r.data);

// Savings Products
export const getSavingsProducts = () => api.get('/savings-products').then(r => r.data);
export const getSavingsProduct = (id) => api.get(`/savings-products/${id}`).then(r => r.data);
export const createSavingsProduct = (data) => api.post('/savings-products', data).then(r => r.data);
export const updateSavingsProduct = (id, data) => api.put(`/savings-products/${id}`, data).then(r => r.data);

// Charges
export const getCharges = () => api.get('/charges').then(r => r.data);
export const createCharge = (data) => api.post('/charges', data).then(r => r.data);
export const updateCharge = (id, data) => api.put(`/charges/${id}`, data).then(r => r.data);
export const deleteCharge = (id) => api.delete(`/charges/${id}`).then(r => r.data);

// Funds
export const getFunds = () => api.get('/funds').then(r => r.data);
export const createFund = (data) => api.post('/funds', data).then(r => r.data);
export const updateFund = (id, data) => api.put(`/funds/${id}`, data).then(r => r.data);
