import 'reflect-metadata';

// Configurações globais para testes
beforeAll(() => {
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_USERNAME = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
  process.env.DB_NAME = 'cognitive_ats_test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.AI_SERVICE_URL = 'http://localhost:8000';
});

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configurar timeout global para testes
jest.setTimeout(10000);
