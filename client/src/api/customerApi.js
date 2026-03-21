import api from './axiosInstance';

export const getLoanProducts = () => api.get('/loan-products').then(r => r.data);
export const getLoanProduct = (id) => api.get(`/loan-products/${id}`).then(r => r.data);
export const getSavingsProducts = () => api.get('/savings-products').then(r => r.data);
export const getSavingsProduct = (id) => api.get(`/savings-products/${id}`).then(r => r.data);
