export interface CorsConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  optionsSuccessStatus?: number;
  preflightContinue?: boolean;
}

export const corsConfig: CorsConfig = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : process.env.NODE_ENV === 'production'
      ? [
          // Produção: origens específicas
          'https://meudominio.com',
          'https://app.meudominio.com',
        ]
      : [
          // Desenvolvimento: aceitar todas as origens
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://localhost:8080',
          'http://127.0.0.1:8080',
          'https://localhost:5173',
          'https://localhost:3000',
          'https://127.0.0.1:5173',
          'https://localhost:8080',
          'https://127.0.0.1:8080',
          // Suporte para Caddy - usar padrões válidos
          'https://gupy.localhost',
          'https://empresa1.localhost',
          'https://teste.localhost',
          'https://ai.localhost',
        ],
  methods: process.env.CORS_METHODS
    ? process.env.CORS_METHODS.split(',').map((method) => method.trim())
    : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS
    ? process.env.CORS_ALLOWED_HEADERS.split(',').map((header) => header.trim())
    : ['Content-Type', 'Authorization'],
  credentials: process.env.CORS_CREDENTIALS
    ? process.env.CORS_CREDENTIALS === 'true'
    : true,
  optionsSuccessStatus: process.env.CORS_OPTIONS_SUCCESS_STATUS
    ? parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS) || 204
    : 204,
  preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE
    ? process.env.CORS_PREFLIGHT_CONTINUE === 'true'
    : false,
};
