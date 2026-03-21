/**
 * Extracts a structured, user-friendly error object from an Axios error.
 * The BFF server sends errors in this format:
 *   { errorId, status, title, message, support, validationErrors? }
 *
 * For network errors (server unreachable), we build a local fallback.
 */
export function parseApiError(error) {
  // Server responded with structured error from our error handler
  if (error.response?.data?.errorId) {
    return error.response.data;
  }

  // Server responded but not in our format (e.g. raw Fineract passthrough)
  if (error.response?.data) {
    const data = error.response.data;
    return {
      errorId: null,
      status: error.response.status,
      title: `Error ${error.response.status}`,
      message: data.defaultUserMessage || data.error || data.message || 'An error occurred.',
      support: null,
      validationErrors: Array.isArray(data.errors)
        ? data.errors.map(e => ({
            field: e.parameterName || 'Field',
            message: e.defaultUserMessage || 'Invalid value',
          }))
        : [],
    };
  }

  // Network error — server unreachable
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return {
      errorId: null,
      status: 0,
      title: 'Connection Error',
      message: 'Unable to reach the server. Please check your network connection and try again.',
      support: null,
      validationErrors: [],
    };
  }

  // Request timeout
  if (error.code === 'ECONNABORTED') {
    return {
      errorId: null,
      status: 408,
      title: 'Request Timeout',
      message: 'The request took too long. Please try again.',
      support: null,
      validationErrors: [],
    };
  }

  // Fallback for unknown errors
  return {
    errorId: null,
    status: 0,
    title: 'Unexpected Error',
    message: 'Something went wrong. Please try again.',
    support: null,
    validationErrors: [],
  };
}
