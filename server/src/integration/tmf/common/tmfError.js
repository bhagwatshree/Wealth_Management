/**
 * TMF Open API standard error format (TMF630 REST API Design Guidelines).
 *
 * Error shape:
 * {
 *   code: "string",          — application-level error code
 *   reason: "string",        — short summary
 *   message: "string",       — detailed explanation
 *   status: "string",        — HTTP status code as string
 *   referenceError: "string" — URL to documentation (optional)
 * }
 */

class TmfError extends Error {
  constructor(code, reason, message, status, referenceError) {
    super(message);
    this.code = code;
    this.reason = reason;
    this.status = status || 500;
    this.referenceError = referenceError || null;
  }

  toJSON() {
    return {
      code: this.code,
      reason: this.reason,
      message: this.message,
      status: String(this.status),
      referenceError: this.referenceError,
      '@type': 'Error',
    };
  }
}

// Pre-built factories
const tmfErrors = {
  notFound: (entity, id) =>
    new TmfError(
      'ERR_NOT_FOUND',
      `${entity} not found`,
      `${entity} with id '${id}' was not found`,
      404
    ),

  badRequest: (reason, details) =>
    new TmfError('ERR_BAD_REQUEST', reason, details || reason, 400),

  conflict: (reason, details) =>
    new TmfError('ERR_CONFLICT', reason, details || reason, 409),

  unprocessable: (reason, details) =>
    new TmfError('ERR_UNPROCESSABLE', reason, details || reason, 422),

  internal: (details) =>
    new TmfError('ERR_INTERNAL', 'Internal Server Error', details || 'An unexpected error occurred', 500),
};

// Express error-handling middleware for TMF routes
function tmfErrorHandler(err, req, res, _next) {
  if (err instanceof TmfError) {
    return res.status(err.status).json(err.toJSON());
  }

  // Wrap non-TMF errors
  const status = err.status || err.statusCode || 500;
  const wrapped = new TmfError(
    'ERR_INTERNAL',
    err.name || 'Error',
    err.message || 'An unexpected error occurred',
    status
  );
  res.status(status).json(wrapped.toJSON());
}

module.exports = { TmfError, tmfErrors, tmfErrorHandler };
