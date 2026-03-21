const crypto = require('crypto');
const { getErrorConfig } = require('../config/errorConfig');

// PII patterns to strip from any error message before sending to client
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,           // emails
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,                     // card numbers
  /\b\d{3}-\d{2}-\d{4}\b/g,                                           // SSN
  /\b\d{12}\b/g,                                                       // Aadhaar
  /\b[A-Z]{5}\d{4}[A-Z]\b/g,                                          // PAN
  /\b\d{10,12}\b/g,                                                    // phone / long IDs
  /\baccount\s*#?\s*\d+\b/gi,                                         // account references
];

function stripPII(text) {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text;
  for (const pattern of PII_PATTERNS) {
    cleaned = cleaned.replace(pattern, '[REDACTED]');
  }
  return cleaned;
}

function generateErrorId() {
  return 'ERR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function matchFineractError(errorData, config) {
  if (!errorData || !config.fineractErrors) return null;

  // Check globalisation code from top-level error
  const globCode = errorData.userMessageGlobalisationCode || errorData.globalisationMessageCode || '';
  for (const [prefix, mapping] of Object.entries(config.fineractErrors)) {
    if (globCode.startsWith(prefix)) return mapping;
  }

  // Check errors array for matching codes
  if (Array.isArray(errorData.errors)) {
    for (const err of errorData.errors) {
      const code = err.userMessageGlobalisationCode || '';
      for (const [prefix, mapping] of Object.entries(config.fineractErrors)) {
        if (code.startsWith(prefix)) return mapping;
      }
    }
  }

  return null;
}

function buildValidationDetails(errorData, config) {
  if (!errorData?.errors || !Array.isArray(errorData.errors)) return [];

  const labels = config.validationFieldLabels || {};

  return errorData.errors.map(err => {
    const fieldLabel = labels[err.parameterName] || err.parameterName || 'Field';
    let message = err.defaultUserMessage || 'Invalid value';
    // Strip raw database/SQL details from validation messages
    if (/duplicate key|unique constraint|integrity|violates|foreign key|SQL|jdbc/i.test(message)) {
      message = 'A record with these details already exists.';
    } else {
      message = stripPII(message);
    }
    return { field: fieldLabel, message };
  });
}

module.exports = (err, req, res, _next) => {
  const config = getErrorConfig();
  const errorId = generateErrorId();
  const status = err.response?.status || err.status || 500;
  const errorData = err.response?.data || null;

  // Log full error server-side (includes details for debugging)
  console.error(`[${errorId}] ${req.method} ${req.path} — Status: ${status}`, {
    fineractResponse: errorData,
    message: err.message,
  });

  // 1. Try Fineract-specific error mapping
  const fineractMatch = matchFineractError(errorData, config);

  // 2. Build validation field details if present
  const validationDetails = buildValidationDetails(errorData, config);

  // 3. Fall back to HTTP status mapping, then global fallback
  const httpMapping = config.httpErrors?.[status];
  const fallback = config.fallback;

  const title = fineractMatch?.title || httpMapping?.title || fallback.title;
  let message = fineractMatch?.message || httpMapping?.message || fallback.message;

  // If Fineract sent a top-level user message and we didn't find a specific mapping,
  // sanitize and use it — but strip raw DB details
  if (!fineractMatch && errorData?.defaultUserMessage) {
    const raw = errorData.defaultUserMessage;
    // Detect raw database constraint/integrity messages and replace with generic message
    if (/duplicate key|unique constraint|integrity|violates|foreign key/i.test(raw)) {
      message = 'A record with the same details already exists. Please use different values.';
    } else {
      message = stripPII(raw);
    }
  }

  const response = {
    errorId,
    status,
    title,
    message,
    support: config.support,
  };

  // Attach validation field errors if any
  if (validationDetails.length > 0) {
    response.validationErrors = validationDetails;
  }

  res.status(status).json(response);
};
