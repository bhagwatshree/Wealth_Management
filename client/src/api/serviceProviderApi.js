import api from './axiosInstance';

// Offices
export const getOffices = () => api.get('/offices').then(r => r.data);
export const createOffice = (data) => api.post('/offices', data).then(r => r.data);
export const updateOffice = (id, data) => api.put(`/offices/${id}`, data).then(r => r.data);

// Staff
export const getStaff = () => api.get('/staff').then(r => r.data);
export const createStaff = (data) => api.post('/staff', data).then(r => r.data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data).then(r => r.data);

// Clients
export const getClients = () => api.get('/clients').then(r => r.data);
export const getClient = (id) => api.get(`/clients/${id}`).then(r => r.data);
export const createClient = (data) => api.post('/clients', data).then(r => r.data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data).then(r => r.data);
export const deleteClient = (id) => api.delete(`/clients/${id}`).then(r => r.data);

// GL Accounts
export const getGLAccounts = () => api.get('/gl-accounts').then(r => r.data);
export const createGLAccount = (data) => api.post('/gl-accounts', data).then(r => r.data);
export const updateGLAccount = (id, data) => api.put(`/gl-accounts/${id}`, data).then(r => r.data);
export const deleteGLAccount = (id) => api.delete(`/gl-accounts/${id}`).then(r => r.data);

// Journal Entries
export const getJournalEntries = (params) => api.get('/journal-entries', { params }).then(r => r.data);
export const createJournalEntry = (data) => api.post('/journal-entries', data).then(r => r.data);

// GL Closures
export const getGLClosures = () => api.get('/gl-closures').then(r => r.data);
export const createGLClosure = (data) => api.post('/gl-closures', data).then(r => r.data);

// Accounting Rules
export const getAccountingRules = () => api.get('/accounting-rules').then(r => r.data);
export const createAccountingRule = (data) => api.post('/accounting-rules', data).then(r => r.data);

// Currencies
export const getCurrencies = () => api.get('/currencies').then(r => r.data);
export const updateCurrencies = (data) => api.put('/currencies', data).then(r => r.data);

// Payment Types
export const getPaymentTypes = () => api.get('/payment-types').then(r => r.data);
export const createPaymentType = (data) => api.post('/payment-types', data).then(r => r.data);
export const updatePaymentType = (id, data) => api.put(`/payment-types/${id}`, data).then(r => r.data);

// Reports
export const getReports = () => api.get('/reports').then(r => r.data);
export const runReport = (name, params) => api.get(`/reports/run/${name}`, { params }).then(r => r.data);

// Audits
export const getAudits = (params) => api.get('/audits', { params }).then(r => r.data);
