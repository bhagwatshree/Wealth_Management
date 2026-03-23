import api from './axiosInstance';

// --- Product Catalog ---
export const getProducts = (params) => api.get('/offers/products', { params }).then(r => r.data);
export const createProduct = (data) => api.post('/offers/products', data).then(r => r.data);
export const getProduct = (id) => api.get(`/offers/products/${id}`).then(r => r.data);
export const updateProduct = (id, data) => api.put(`/offers/products/${id}`, data).then(r => r.data);
export const getProductCategories = () => api.get('/offers/products/categories').then(r => r.data);
export const linkToFineract = (id, fineractProductId, fineractProductType) =>
  api.post(`/offers/products/${id}/link-fineract`, { fineractProductId, fineractProductType }).then(r => r.data);

// --- NAV ---
export const getAllNav = () => api.get('/offers/nav').then(r => r.data);
export const getNav = (fundCode) => api.get(`/offers/nav/${fundCode}`).then(r => r.data);
export const getNavHistory = (fundCode, limit) => api.get(`/offers/nav/${fundCode}/history`, { params: { limit } }).then(r => r.data);
export const triggerNavUpdate = (csvData, format) => api.post('/offers/nav/trigger', { csvData, format }).then(r => r.data);

// --- Batch ---
export const getBatchStatus = () => api.get('/offers/batch/status').then(r => r.data);
export const getBatch = (id) => api.get(`/offers/batch/${id}`).then(r => r.data);
export const scheduleBatch = (data) => api.post('/offers/batch/schedule', data).then(r => r.data);
export const cancelBatch = (jobId) => api.delete(`/offers/batch/schedule/${jobId}`).then(r => r.data);
