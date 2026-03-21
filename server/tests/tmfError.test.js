import { describe, it, expect, vi } from 'vitest';

const { TmfError, tmfErrors, tmfErrorHandler } = await import('../src/integration/tmf/common/tmfError.js');

describe('tmfError', () => {
  describe('TmfError', () => {
    it('toJSON returns correct shape', () => {
      const error = new TmfError('ERR_TEST', 'Test Reason', 'Test message details', 400);
      const json = error.toJSON();

      expect(json).toEqual({
        code: 'ERR_TEST',
        reason: 'Test Reason',
        message: 'Test message details',
        status: '400',
        referenceError: null,
        '@type': 'Error',
      });
    });

    it('extends Error', () => {
      const error = new TmfError('ERR_X', 'reason', 'msg', 500);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('msg');
    });

    it('defaults status to 500 when not provided', () => {
      const error = new TmfError('ERR_X', 'reason', 'msg');
      expect(error.status).toBe(500);
    });

    it('includes referenceError when provided', () => {
      const error = new TmfError('ERR_X', 'reason', 'msg', 400, 'https://docs.example.com/errors/ERR_X');
      const json = error.toJSON();
      expect(json.referenceError).toBe('https://docs.example.com/errors/ERR_X');
    });

    it('status is serialized as string in toJSON', () => {
      const error = new TmfError('ERR_X', 'reason', 'msg', 422);
      const json = error.toJSON();
      expect(json.status).toBe('422');
      expect(typeof json.status).toBe('string');
    });
  });

  describe('tmfErrors factory functions', () => {
    it('notFound creates 404 error', () => {
      const error = tmfErrors.notFound('Product', 'prod-123');

      expect(error).toBeInstanceOf(TmfError);
      expect(error.status).toBe(404);
      expect(error.code).toBe('ERR_NOT_FOUND');
      expect(error.reason).toBe('Product not found');
      expect(error.message).toBe("Product with id 'prod-123' was not found");
    });

    it('badRequest creates 400 error', () => {
      const error = tmfErrors.badRequest('Missing required field', 'The "name" field is required');

      expect(error).toBeInstanceOf(TmfError);
      expect(error.status).toBe(400);
      expect(error.code).toBe('ERR_BAD_REQUEST');
      expect(error.reason).toBe('Missing required field');
      expect(error.message).toBe('The "name" field is required');
    });

    it('badRequest uses reason as message when details not provided', () => {
      const error = tmfErrors.badRequest('Invalid input');
      expect(error.message).toBe('Invalid input');
    });

    it('conflict creates 409 error', () => {
      const error = tmfErrors.conflict('Duplicate entry', 'A record with that name already exists');

      expect(error).toBeInstanceOf(TmfError);
      expect(error.status).toBe(409);
      expect(error.code).toBe('ERR_CONFLICT');
    });

    it('unprocessable creates 422 error', () => {
      const error = tmfErrors.unprocessable('Validation failed', 'Min investment exceeds max');

      expect(error).toBeInstanceOf(TmfError);
      expect(error.status).toBe(422);
      expect(error.code).toBe('ERR_UNPROCESSABLE');
    });

    it('internal creates 500 error', () => {
      const error = tmfErrors.internal('Database connection lost');

      expect(error).toBeInstanceOf(TmfError);
      expect(error.status).toBe(500);
      expect(error.code).toBe('ERR_INTERNAL');
      expect(error.reason).toBe('Internal Server Error');
      expect(error.message).toBe('Database connection lost');
    });

    it('internal uses default message when details not provided', () => {
      const error = tmfErrors.internal();
      expect(error.message).toBe('An unexpected error occurred');
    });
  });

  describe('tmfErrorHandler', () => {
    function createMockRes() {
      const res = {
        statusCode: null,
        body: null,
        status: vi.fn(function (code) {
          res.statusCode = code;
          return res;
        }),
        json: vi.fn(function (data) {
          res.body = data;
          return res;
        }),
      };
      return res;
    }

    const mockReq = {};
    const mockNext = vi.fn();

    it('sends TMF-formatted response for TmfError', () => {
      const res = createMockRes();
      const error = tmfErrors.notFound('Customer', 'cust-999');

      tmfErrorHandler(error, mockReq, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'ERR_NOT_FOUND',
          reason: 'Customer not found',
          status: '404',
          '@type': 'Error',
        })
      );
    });

    it('wraps non-TMF errors in TMF format', () => {
      const res = createMockRes();
      const genericError = new Error('Something went wrong');

      tmfErrorHandler(genericError, mockReq, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'ERR_INTERNAL',
          message: 'Something went wrong',
          status: '500',
          '@type': 'Error',
        })
      );
    });

    it('preserves status from non-TMF error if available', () => {
      const res = createMockRes();
      const httpError = new Error('Forbidden');
      httpError.status = 403;

      tmfErrorHandler(httpError, mockReq, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: '403',
        })
      );
    });

    it('uses statusCode from non-TMF error if status is not set', () => {
      const res = createMockRes();
      const httpError = new Error('Not Acceptable');
      httpError.statusCode = 406;

      tmfErrorHandler(httpError, mockReq, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(406);
    });
  });
});
