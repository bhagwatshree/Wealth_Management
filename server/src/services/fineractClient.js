const axios = require('axios');
const https = require('https');
const config = require('../config/env');

const token = Buffer.from(`${config.fineract.username}:${config.fineract.password}`).toString('base64');

const fineractApi = axios.create({
  baseURL: config.fineract.baseUrl,
  headers: {
    'Authorization': `Basic ${token}`,
    'Fineract-Platform-TenantId': config.fineract.tenantId,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

module.exports = { fineractApi };
