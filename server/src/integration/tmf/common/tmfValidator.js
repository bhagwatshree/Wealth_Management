/**
 * TMF request validation helpers.
 * Validates required fields, allowed values, and TMF-standard query params.
 */

const { tmfErrors } = require('./tmfError');

function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length > 0) {
    throw tmfErrors.badRequest(
      'Missing required fields',
      `The following fields are required: ${missing.join(', ')}`
    );
  }
}

function validateEnum(value, fieldName, allowedValues) {
  if (value && !allowedValues.includes(value)) {
    throw tmfErrors.badRequest(
      `Invalid value for ${fieldName}`,
      `Allowed values: ${allowedValues.join(', ')}`
    );
  }
}

function parseTmfQuery(req) {
  return {
    offset: Math.max(0, parseInt(req.query.offset) || 0),
    limit: Math.min(100, Math.max(1, parseInt(req.query.limit) || 20)),
    fields: req.query.fields || null,
    sort: req.query.sort || null,
  };
}

module.exports = { requireFields, validateEnum, parseTmfQuery };
