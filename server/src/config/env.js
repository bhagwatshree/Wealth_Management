require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  fineract: {
    baseUrl: process.env.FINERACT_BASE_URL || 'http://localhost:8443/fineract-provider/api/v1',
    username: process.env.FINERACT_USERNAME || 'mifos',
    password: process.env.FINERACT_PASSWORD || 'password',
    tenantId: process.env.FINERACT_TENANT_ID || 'default',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'https://localhost:5173',
  ssl: {
    key: process.env.SSL_KEY || '../certs/key.pem',
    cert: process.env.SSL_CERT || '../certs/cert.pem',
  },

  // Orchestration Layer (DxL)
  orchestration: {
    autoVerifyKyc: process.env.DXL_AUTO_VERIFY_KYC === 'true',
  },

  // SFTP configuration for fund manager file ingestion
  sftp: {
    defaultPort: parseInt(process.env.SFTP_DEFAULT_PORT) || 22,
    connectionTimeout: parseInt(process.env.SFTP_TIMEOUT) || 30000,
  },

  // Batch processing
  batch: {
    navUpdateCron: process.env.NAV_UPDATE_CRON || '0 18 * * 1-5', // weekdays at 18:00
    dataDir: process.env.BATCH_DATA_DIR || '../data',
  },
};
