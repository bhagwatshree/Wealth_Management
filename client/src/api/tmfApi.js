import api from './axiosInstance';

// --- TMF API Discovery ---
export const getTmfApis = () => api.get('/tmf');

// --- TMF620 Product Catalog ---
export const tmf620 = {
  getProducts: (params) => api.get('/tmf/tmf620/productOffering', { params }),
  createProduct: (data) => api.post('/tmf/tmf620/productOffering', data),
  getProduct: (id) => api.get(`/tmf/tmf620/productOffering/${id}`),
  updateProduct: (id, data) => api.patch(`/tmf/tmf620/productOffering/${id}`, data),
  getCategories: (params) => api.get('/tmf/tmf620/productCategory', { params }),
};

// --- TMF629 Customer Management ---
export const tmf629 = {
  getCustomers: (params) => api.get('/tmf/tmf629/customer', { params }),
  createCustomer: (data) => api.post('/tmf/tmf629/customer', data),
  getCustomer: (id) => api.get(`/tmf/tmf629/customer/${id}`),
  updateCustomer: (id, data) => api.patch(`/tmf/tmf629/customer/${id}`, data),
};

// --- TMF632 Party Management ---
export const tmf632 = {
  createIndividual: (data) => api.post('/tmf/tmf632/individual', data),
  getIndividual: (id) => api.get(`/tmf/tmf632/individual/${id}`),
  verifyIndividual: (id, data) => api.patch(`/tmf/tmf632/individual/${id}`, data),
  screenIndividual: (id) => api.post(`/tmf/tmf632/individual/${id}/screening`),
};

// --- TMF681 Communication ---
export const tmf681 = {
  getMessages: (params) => api.get('/tmf/tmf681/communicationMessage', { params }),
  createMessage: (data) => api.post('/tmf/tmf681/communicationMessage', data),
  getMessage: (id) => api.get(`/tmf/tmf681/communicationMessage/${id}`),
  updateMessage: (id, data) => api.patch(`/tmf/tmf681/communicationMessage/${id}`, data),
  sendMessage: (id, data) => api.post(`/tmf/tmf681/communicationMessage/${id}/send`, data),
};

// --- TMF688 Event Management ---
export const tmf688 = {
  getEvents: (params) => api.get('/tmf/tmf688/event', { params }),
  getEvent: (id) => api.get(`/tmf/tmf688/event/${id}`),
  getEventTypes: () => api.get('/tmf/tmf688/eventType'),
  subscribe: (data) => api.post('/tmf/tmf688/hub', data),
  getSubscriptions: () => api.get('/tmf/tmf688/hub'),
  unsubscribe: (id) => api.delete(`/tmf/tmf688/hub/${id}`),
};
