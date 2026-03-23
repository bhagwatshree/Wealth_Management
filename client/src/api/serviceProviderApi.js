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

// GL Closures (additional operations)
export const updateGLClosure = (id, data) => api.put(`/gl-closures/${id}`, data).then(r => r.data);
export const deleteGLClosure = (id) => api.delete(`/gl-closures/${id}`).then(r => r.data);

// Accounting Rules (additional operations)
export const updateAccountingRule = (id, data) => api.put(`/accounting-rules/${id}`, data).then(r => r.data);
export const deleteAccountingRule = (id) => api.delete(`/accounting-rules/${id}`).then(r => r.data);

// Holidays
export const getHolidays = (officeId) => api.get('/holidays', { params: { officeId } }).then(r => r.data);
export const createHoliday = (data) => api.post('/holidays', data).then(r => r.data);
export const updateHoliday = (id, data) => api.put(`/holidays/${id}`, data).then(r => r.data);
export const deleteHoliday = (id) => api.delete(`/holidays/${id}`).then(r => r.data);

// Working Days
export const getWorkingDays = () => api.get('/working-days').then(r => r.data);
export const updateWorkingDays = (data) => api.put('/working-days', data).then(r => r.data);

// Tellers
export const getTellers = () => api.get('/tellers').then(r => r.data);
export const createTeller = (data) => api.post('/tellers', data).then(r => r.data);
export const updateTeller = (id, data) => api.put(`/tellers/${id}`, data).then(r => r.data);
export const getTellerCashiers = (tellerId) => api.get(`/tellers/${tellerId}/cashiers`).then(r => r.data);
export const createCashier = (tellerId, data) => api.post(`/tellers/${tellerId}/cashiers`, data).then(r => r.data);

// Fixed Deposit Products
export const getFixedDepositProducts = () => api.get('/fixed-deposit-products').then(r => r.data);
export const createFixedDepositProduct = (data) => api.post('/fixed-deposit-products', data).then(r => r.data);
export const updateFixedDepositProduct = (id, data) => api.put(`/fixed-deposit-products/${id}`, data).then(r => r.data);

// Recurring Deposit Products
export const getRecurringDepositProducts = () => api.get('/recurring-deposit-products').then(r => r.data);
export const createRecurringDepositProduct = (data) => api.post('/recurring-deposit-products', data).then(r => r.data);
export const updateRecurringDepositProduct = (id, data) => api.put(`/recurring-deposit-products/${id}`, data).then(r => r.data);

// Share Products
export const getShareProducts = () => api.get('/share-products').then(r => r.data);
export const createShareProduct = (data) => api.post('/share-products', data).then(r => r.data);
export const updateShareProduct = (id, data) => api.put(`/share-products/${id}`, data).then(r => r.data);

// Floating Rates
export const getFloatingRates = () => api.get('/floating-rates').then(r => r.data);
export const createFloatingRate = (data) => api.post('/floating-rates', data).then(r => r.data);
export const updateFloatingRate = (id, data) => api.put(`/floating-rates/${id}`, data).then(r => r.data);

// Products Mix
export const getProductsMix = () => api.get('/products-mix').then(r => r.data);
export const createProductMix = (data) => api.post('/products-mix', data).then(r => r.data);
export const deleteProductMix = (id) => api.delete(`/products-mix/${id}`).then(r => r.data);

// Collaterals
export const getCollaterals = () => api.get('/collaterals').then(r => r.data);
export const createCollateral = (data) => api.post('/collaterals', data).then(r => r.data);
export const updateCollateral = (id, data) => api.put(`/collaterals/${id}`, data).then(r => r.data);
export const deleteCollateral = (id) => api.delete(`/collaterals/${id}`).then(r => r.data);

// Tax Components
export const getTaxComponents = () => api.get('/tax-components').then(r => r.data);
export const createTaxComponent = (data) => api.post('/tax-components', data).then(r => r.data);
export const updateTaxComponent = (id, data) => api.put(`/tax-components/${id}`, data).then(r => r.data);

// Tax Groups
export const getTaxGroups = () => api.get('/tax-groups').then(r => r.data);
export const createTaxGroup = (data) => api.post('/tax-groups', data).then(r => r.data);
export const updateTaxGroup = (id, data) => api.put(`/tax-groups/${id}`, data).then(r => r.data);

// Delinquency Ranges
export const getDelinquencyRanges = () => api.get('/delinquency-ranges').then(r => r.data);
export const createDelinquencyRange = (data) => api.post('/delinquency-ranges', data).then(r => r.data);
export const updateDelinquencyRange = (id, data) => api.put(`/delinquency-ranges/${id}`, data).then(r => r.data);
export const deleteDelinquencyRange = (id) => api.delete(`/delinquency-ranges/${id}`).then(r => r.data);

// Delinquency Buckets
export const getDelinquencyBuckets = () => api.get('/delinquency-buckets').then(r => r.data);
export const createDelinquencyBucket = (data) => api.post('/delinquency-buckets', data).then(r => r.data);
export const updateDelinquencyBucket = (id, data) => api.put(`/delinquency-buckets/${id}`, data).then(r => r.data);
export const deleteDelinquencyBucket = (id) => api.delete(`/delinquency-buckets/${id}`).then(r => r.data);

// Codes
export const getCodes = () => api.get('/codes').then(r => r.data);
export const createCode = (data) => api.post('/codes', data).then(r => r.data);
export const updateCode = (id, data) => api.put(`/codes/${id}`, data).then(r => r.data);
export const deleteCode = (id) => api.delete(`/codes/${id}`).then(r => r.data);
export const getCodeValues = (codeId) => api.get(`/codes/${codeId}/codevalues`).then(r => r.data);
export const createCodeValue = (codeId, data) => api.post(`/codes/${codeId}/codevalues`, data).then(r => r.data);

// Roles & Permissions
export const getRoles = () => api.get('/roles').then(r => r.data);
export const createRole = (data) => api.post('/roles', data).then(r => r.data);
export const updateRole = (id, data) => api.put(`/roles/${id}`, data).then(r => r.data);
export const deleteRole = (id) => api.delete(`/roles/${id}`).then(r => r.data);
export const getRolePermissions = (id) => api.get(`/roles/${id}/permissions`).then(r => r.data);
export const updateRolePermissions = (id, data) => api.put(`/roles/${id}/permissions`, data).then(r => r.data);

// Data Tables
export const getDataTables = () => api.get('/data-tables').then(r => r.data);
export const createDataTable = (data) => api.post('/data-tables', data).then(r => r.data);
export const deleteDataTable = (name) => api.delete(`/data-tables/${name}`).then(r => r.data);

// Maker Checker
export const getMakerCheckerTasks = (params) => api.get('/maker-checker', { params }).then(r => r.data);
export const approveMakerCheckerTask = (id) => api.post(`/maker-checker/${id}?command=approve`).then(r => r.data);
export const rejectMakerCheckerTask = (id) => api.post(`/maker-checker/${id}?command=reject`).then(r => r.data);

// Scheduler Jobs
export const getSchedulerJobs = () => api.get('/scheduler-jobs').then(r => r.data);
export const updateSchedulerJob = (id, data) => api.put(`/scheduler-jobs/${id}`, data).then(r => r.data);
export const runSchedulerJob = (id) => api.post(`/scheduler-jobs/${id}?command=executeJob`).then(r => r.data);
export const getJobRunHistory = (id) => api.get(`/scheduler-jobs/${id}/runhistory`).then(r => r.data);

// Global Configurations
export const getConfigurations = () => api.get('/configurations').then(r => r.data);
export const updateConfiguration = (id, data) => api.put(`/configurations/${id}`, data).then(r => r.data);

// Account Number Preferences
export const getAccountNumberPreferences = () => api.get('/account-number-preferences').then(r => r.data);
export const createAccountNumberPreference = (data) => api.post('/account-number-preferences', data).then(r => r.data);
export const updateAccountNumberPreference = (id, data) => api.put(`/account-number-preferences/${id}`, data).then(r => r.data);
export const deleteAccountNumberPreference = (id) => api.delete(`/account-number-preferences/${id}`).then(r => r.data);

// External Services
export const getExternalServices = () => api.get('/external-services').then(r => r.data);
export const getExternalService = (name) => api.get(`/external-services/${name}`).then(r => r.data);
export const updateExternalService = (name, data) => api.put(`/external-services/${name}`, data).then(r => r.data);

// Hooks
export const getHooks = () => api.get('/hooks').then(r => r.data);
export const createHook = (data) => api.post('/hooks', data).then(r => r.data);
export const updateHook = (id, data) => api.put(`/hooks/${id}`, data).then(r => r.data);
export const deleteHook = (id) => api.delete(`/hooks/${id}`).then(r => r.data);

// Financial Activity Mappings
export const getFinancialActivityMappings = () => api.get('/financial-activity-mappings').then(r => r.data);
export const createFinancialActivityMapping = (data) => api.post('/financial-activity-mappings', data).then(r => r.data);
export const updateFinancialActivityMapping = (id, data) => api.put(`/financial-activity-mappings/${id}`, data).then(r => r.data);
export const deleteFinancialActivityMapping = (id) => api.delete(`/financial-activity-mappings/${id}`).then(r => r.data);

// Provisioning Entries
export const getProvisioningEntries = () => api.get('/provisioning-entries').then(r => r.data);
export const createProvisioningEntry = (data) => api.post('/provisioning-entries', data).then(r => r.data);

// Provisioning Criteria
export const getProvisioningCriteria = () => api.get('/provisioning-criteria').then(r => r.data);
export const createProvisioningCriterion = (data) => api.post('/provisioning-criteria', data).then(r => r.data);
export const updateProvisioningCriterion = (id, data) => api.put(`/provisioning-criteria/${id}`, data).then(r => r.data);
export const deleteProvisioningCriterion = (id) => api.delete(`/provisioning-criteria/${id}`).then(r => r.data);
