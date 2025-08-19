import { corsConfig } from './cors.config';

describe('CORS Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Default Configuration', () => {
    it('should use default values when no environment variables are set', () => {
      // Limpar variáveis de ambiente
      delete process.env.CORS_ORIGIN;
      delete process.env.CORS_METHODS;
      delete process.env.CORS_ALLOWED_HEADERS;
      delete process.env.CORS_CREDENTIALS;
      delete process.env.CORS_OPTIONS_SUCCESS_STATUS;
      delete process.env.CORS_PREFLIGHT_CONTINUE;

      // Reimportar para aplicar as mudanças
      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.origin).toEqual([
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
      ]);
      expect(freshConfig.methods).toEqual([
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS',
      ]);
      expect(freshConfig.allowedHeaders).toEqual([
        'Content-Type',
        'Authorization',
      ]);
      expect(freshConfig.credentials).toBe(true);
      expect(freshConfig.optionsSuccessStatus).toBe(204);
      expect(freshConfig.preflightContinue).toBe(false);
    });
  });

  describe('Environment Variable Overrides', () => {
    it('should parse CORS_ORIGIN from comma-separated string', () => {
      process.env.CORS_ORIGIN = 'https://example.com,https://app.example.com';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.origin).toEqual([
        'https://example.com',
        'https://app.example.com',
      ]);
    });

    it('should parse CORS_METHODS from comma-separated string', () => {
      process.env.CORS_METHODS = 'GET,POST,PUT';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.methods).toEqual(['GET', 'POST', 'PUT']);
    });

    it('should parse CORS_ALLOWED_HEADERS from comma-separated string', () => {
      process.env.CORS_ALLOWED_HEADERS =
        'Content-Type,Authorization,X-Requested-With';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.allowedHeaders).toEqual([
        'Content-Type',
        'Authorization',
        'X-Requested-With',
      ]);
    });

    it('should parse CORS_CREDENTIALS as boolean', () => {
      process.env.CORS_CREDENTIALS = 'false';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.credentials).toBe(false);
    });

    it('should parse CORS_OPTIONS_SUCCESS_STATUS as number', () => {
      process.env.CORS_OPTIONS_SUCCESS_STATUS = '200';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.optionsSuccessStatus).toBe(200);
    });

    it('should parse CORS_PREFLIGHT_CONTINUE as boolean', () => {
      process.env.CORS_PREFLIGHT_CONTINUE = 'true';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.preflightContinue).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty CORS_ORIGIN environment variable', () => {
      process.env.CORS_ORIGIN = '';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.origin).toEqual([
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
      ]);
    });

    it('should handle whitespace in comma-separated values', () => {
      process.env.CORS_ORIGIN =
        ' https://example.com , https://app.example.com ';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.origin).toEqual([
        'https://example.com',
        'https://app.example.com',
      ]);
    });

    it('should handle invalid CORS_OPTIONS_SUCCESS_STATUS gracefully', () => {
      process.env.CORS_OPTIONS_SUCCESS_STATUS = 'invalid';

      jest.resetModules();
      const { corsConfig: freshConfig } = require('./cors.config');

      expect(freshConfig.optionsSuccessStatus).toBe(204); // valor padrão
    });
  });
});
