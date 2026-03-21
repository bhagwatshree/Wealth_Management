const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const { getErrorConfig } = require('./config/errorConfig');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'UP' }));

// Error config endpoint — serves support info and HTTP error messages to client
app.get('/api/error-config', (req, res) => {
  const cfg = getErrorConfig();
  res.json({
    support: cfg.support,
    httpErrors: cfg.httpErrors,
    fallback: cfg.fallback,
  });
});

// Routes — Fineract Proxy
app.use('/api/offices', require('./routes/offices'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/loan-products', require('./routes/loanProducts'));
app.use('/api/savings-products', require('./routes/savingsProducts'));
app.use('/api/charges', require('./routes/charges'));
app.use('/api/funds', require('./routes/funds'));
app.use('/api/gl-accounts', require('./routes/glAccounts'));
app.use('/api/journal-entries', require('./routes/journalEntries'));
app.use('/api/gl-closures', require('./routes/glClosures'));
app.use('/api/accounting-rules', require('./routes/accountingRules'));
app.use('/api/currencies', require('./routes/currencies'));
app.use('/api/payment-types', require('./routes/paymentTypes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/audits', require('./routes/audits'));
app.use('/api/financial-activity-accounts', require('./routes/financialActivity'));

// Routes — Orchestration Layer (DxL)
app.use('/api/dxl/kyc', require('./orchestration/routes/kycRoutes'));
app.use('/api/dxl/onboard', require('./orchestration/routes/onboardingRoutes'));
app.use('/api/dxl/screening', require('./orchestration/routes/screeningRoutes'));
app.use('/api/dxl/crm', require('./orchestration/routes/crmRoutes'));
app.use('/api/dxl/cvm', require('./orchestration/routes/cvmRoutes'));
app.use('/api/dxl/workflows', require('./orchestration/routes/workflowRoutes'));

// Routes — Offer Management (independent module)
app.use('/api/offers/products', require('./offers/routes/productCatalogRoutes'));
app.use('/api/offers/nav', require('./offers/routes/navRoutes'));
app.use('/api/offers/batch', require('./offers/routes/batchRoutes'));

// Routes — TMF Open API Integration Layer (standardized APIs)
const { tmfErrorHandler } = require('./integration/tmf/common/tmfError');
app.use('/api/tmf/tmf620', require('./integration/tmf/routes/tmf620ProductCatalog'));
app.use('/api/tmf/tmf629', require('./integration/tmf/routes/tmf629CustomerManagement'));
app.use('/api/tmf/tmf632', require('./integration/tmf/routes/tmf632PartyManagement'));
app.use('/api/tmf/tmf681', require('./integration/tmf/routes/tmf681CommunicationManagement'));
app.use('/api/tmf/tmf688', require('./integration/tmf/routes/tmf688EventManagement'));

// TMF API discovery endpoint
app.get('/api/tmf', (req, res) => {
  res.json({
    '@type': 'TMFApiDirectory',
    apis: [
      { id: 'TMF620', name: 'Product Catalog Management', version: '4.0', href: '/api/tmf/tmf620/productOffering' },
      { id: 'TMF629', name: 'Customer Management', version: '4.0', href: '/api/tmf/tmf629/customer' },
      { id: 'TMF632', name: 'Party Management', version: '4.0', href: '/api/tmf/tmf632/individual' },
      { id: 'TMF681', name: 'Communication Management', version: '4.0', href: '/api/tmf/tmf681/communicationMessage' },
      { id: 'TMF688', name: 'Event Management', version: '4.0', href: '/api/tmf/tmf688/event' },
    ],
  });
});

// Initialize event-driven subsystems
require('./events/eventBus');
require('./orchestration/workflows/campaignTriggerWorkflow').init();
require('./offers/services/batchScheduler').init();

// TMF error handler (before generic handler, handles TMF routes)
app.use('/api/tmf', tmfErrorHandler);
app.use(errorHandler);

const sslKey = path.resolve(__dirname, '..', config.ssl.key);
const sslCert = path.resolve(__dirname, '..', config.ssl.cert);

const httpsOptions = {
  key: fs.readFileSync(sslKey),
  cert: fs.readFileSync(sslCert),
};

https.createServer(httpsOptions, app).listen(config.port, () => {
  console.log(`BFF server running on https://localhost:${config.port}`);
  console.log(`Proxying to Fineract at ${config.fineract.baseUrl}`);
});
