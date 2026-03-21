import { describe, it, expect } from 'vitest';
import { parseApiError } from '../utils/errorHelper';

describe('parseApiError', () => {
  it('parses server error response with structured errorId', () => {
    const error = {
      response: {
        data: {
          errorId: 'ERR-001',
          status: 400,
          title: 'Bad Request',
          message: 'Invalid input',
          support: 'ref-123',
        },
      },
    };
    const result = parseApiError(error);
    expect(result).toEqual(error.response.data);
  });

  it('parses validation errors from raw Fineract response', () => {
    const error = {
      response: {
        status: 422,
        data: {
          defaultUserMessage: 'Validation failed',
          errors: [
            { parameterName: 'name', defaultUserMessage: 'Name is required' },
            { parameterName: 'amount', defaultUserMessage: 'Amount must be positive' },
          ],
        },
      },
    };
    const result = parseApiError(error);
    expect(result.status).toBe(422);
    expect(result.message).toBe('Validation failed');
    expect(result.validationErrors).toHaveLength(2);
    expect(result.validationErrors[0]).toEqual({ field: 'name', message: 'Name is required' });
    expect(result.validationErrors[1]).toEqual({ field: 'amount', message: 'Amount must be positive' });
  });

  it('handles network errors (no response)', () => {
    const error = { code: 'ERR_NETWORK', message: 'Network Error' };
    const result = parseApiError(error);
    expect(result.status).toBe(0);
    expect(result.title).toBe('Connection Error');
    expect(result.validationErrors).toEqual([]);
  });

  it('handles timeout errors', () => {
    const error = { code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' };
    const result = parseApiError(error);
    expect(result.status).toBe(408);
    expect(result.title).toBe('Request Timeout');
    expect(result.validationErrors).toEqual([]);
  });

  it('handles unknown error shapes with fallback', () => {
    const error = { something: 'unexpected' };
    const result = parseApiError(error);
    expect(result.status).toBe(0);
    expect(result.title).toBe('Unexpected Error');
    expect(result.message).toBe('Something went wrong. Please try again.');
    expect(result.validationErrors).toEqual([]);
  });
});
