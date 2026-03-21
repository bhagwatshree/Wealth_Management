import api from './axiosInstance';

// --- Product Catalog ---
export const getProducts = (params) => api.get('/offers/products', { params });
export const createProduct = (data) => api.post('/offers/products', data);
export const getProduct = (id) => api.get(`/offers/products/${id}`);
export const updateProduct = (id, data) => api.put(`/offers/products/${id}`, data);
export const getProductCategories = () => api.get('/offers/products/categories');
export const linkToFineract = (id, fineractProductId, fineractProductType) =>
  api.post(`/offers/products/${id}/link-fineract`, { fineractProductId, fineractProductType });

// --- NAV ---
export const getAllNav = () => api.get('/offers/nav');
export const getNav = (fundCode) => api.get(`/offers/nav/${fundCode}`);
export const getNavHistory = (fundCode, limit) => api.get(`/offers/nav/${fundCode}/history`, { params: { limit } });
export const triggerNavUpdate = (csvData, format) => api.post('/offers/nav/trigger', { csvData, format });

// --- Batch ---
export const getBatchStatus = () => api.get('/offers/batch/status');
export const getBatch = (id) => api.get(`/offers/batch/${id}`);
export const scheduleBatch = (data) => api.post('/offers/batch/schedule', data);
export const cancelBatch = (jobId) => api.delete(`/offers/batch/schedule/${jobId}`);
