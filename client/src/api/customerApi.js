import api from './axiosInstance';

export const getLoanProducts = () => api.get('/loan-products').then(r => r.data);
export const getLoanProduct = (id) => api.get(`/loan-products/${id}`).then(r => r.data);
export const getSavingsProducts = () => api.get('/savings-products').then(r => r.data);
export const getSavingsProduct = (id) => api.get(`/savings-products/${id}`).then(r => r.data);

// Register customer in Fineract (called at signup/login)
export const registerCustomer = (data) => api.post('/dxl/customers/register', data).then(r => r.data);
export const getCustomerProfile = (email) => api.get(`/dxl/customers/profile/${encodeURIComponent(email)}`).then(r => r.data);

// Document upload for Fineract client
export const uploadClientDocument = (clientId, file, name, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name || file.name);
  formData.append('description', description || '');
  return api.post(`/client-documents/${clientId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const uploadClientImage = (clientId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/client-documents/${clientId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const getClientDocuments = (clientId) =>
  api.get(`/client-documents/${clientId}`).then(r => r.data);
