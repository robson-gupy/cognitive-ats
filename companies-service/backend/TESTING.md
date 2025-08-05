# Guia de Testes - Companies Service Backend

Este documento explica como executar e escrever testes para o backend do Companies Service.

## Tipos de Testes

### 1. Testes de Unidade (Unit Tests)
- **Localização**: `src/**/*.spec.ts`
- **Configuração**: `jest.config.js`
- **Comando**: `npm run test:unit`

### 2. Testes de Integração (Integration Tests)
- **Localização**: `src/**/*.integration-spec.ts`
- **Configuração**: `test/jest-integration.json`
- **Comando**: `npm run test:integration`

### 3. Testes End-to-End (E2E Tests)
- **Localização**: `test/**/*.e2e-spec.ts`
- **Configuração**: `test/jest-e2e.json`
- **Comando**: `npm run test:e2e`

## Comandos Disponíveis

```bash
# Testes de unidade
npm run test:unit              # Executar todos os testes de unidade
npm run test:unit:watch        # Executar em modo watch
npm run test:unit:cov          # Executar com cobertura

# Testes de integração
npm run test:integration       # Executar todos os testes de integração
npm run test:integration:watch # Executar em modo watch

# Testes E2E
npm run test:e2e              # Executar testes end-to-end

# Todos os testes
npm run test:all              # Executar todos os tipos de teste

# Testes gerais
npm run test                  # Executar todos os testes (padrão)
npm run test:watch            # Executar em modo watch
npm run test:cov              # Executar com cobertura
npm run test:debug            # Executar em modo debug
```

## Estrutura de Testes

### Testes de Unidade
```
src/
├── auth/
│   ├── auth.service.spec.ts      # Teste do AuthService
│   └── auth.controller.spec.ts   # Teste do AuthController
├── companies/
│   ├── companies.service.spec.ts # Teste do CompaniesService
│   └── companies.controller.spec.ts # Teste do CompaniesController
└── app.service.spec.ts           # Teste do AppService
```

### Padrão de Nomenclatura
- **Testes de unidade**: `*.spec.ts`
- **Testes de integração**: `*.integration-spec.ts`
- **Testes E2E**: `*.e2e-spec.ts`

## Como Escrever Testes

### 1. Teste de Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { YourRepository } from './your.repository';

describe('YourService', () => {
  let service: YourService;
  let repository: YourRepository;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: YourRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    repository = module.get<YourRepository>(YourRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of items', async () => {
      const expectedResult = [{ id: 1, name: 'Test' }];
      mockRepository.find.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});
```

### 2. Teste de Controller

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourController } from './your.controller';
import { YourService } from './your.service';
import { CreateYourDto } from './dto/create-your.dto';

describe('YourController', () => {
  let controller: YourController;
  let service: YourService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        {
          provide: YourService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
    service = module.get<YourService>(YourService);
  });

  describe('create', () => {
    it('should create an item', async () => {
      const createDto: CreateYourDto = { name: 'Test' };
      const expectedResult = { id: 1, ...createDto };

      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });
});
```

### 3. Teste de Integração

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('YourController (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/your-endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/your-endpoint')
      .expect(200);
  });
});
```

## Configuração de Ambiente

### Variáveis de Ambiente para Testes
As seguintes variáveis são configuradas automaticamente no `test/setup.ts`:

```typescript
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'cognitive_ats_test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.AI_SERVICE_URL = 'http://localhost:8000';
```

### Banco de Dados de Teste
Para testes de integração, recomenda-se usar um banco de dados separado:

```sql
CREATE DATABASE cognitive_ats_test;
```

## Cobertura de Código

### Executar com Cobertura
```bash
npm run test:unit:cov
```

### Arquivos Excluídos da Cobertura
- `*.module.ts` - Módulos NestJS
- `index.ts` - Arquivos de índice
- `main.ts` - Arquivo principal
- `migrations/**` - Migrações do banco
- `dto/**` - DTOs
- `entities/**` - Entidades
- `interfaces/**` - Interfaces
- `guards/**` - Guards
- `strategies/**` - Estratégias

## Boas Práticas

### 1. Organização
- Um arquivo de teste para cada arquivo de código
- Agrupar testes relacionados em `describe` blocks
- Usar nomes descritivos para os testes

### 2. Mocks
- Mockar dependências externas (banco, APIs)
- Usar `jest.clearAllMocks()` após cada teste
- Criar mocks específicos para cada cenário

### 3. Assertions
- Testar tanto casos de sucesso quanto de erro
- Verificar se os métodos foram chamados com os parâmetros corretos
- Usar assertions específicas do Jest

### 4. Performance
- Manter testes rápidos e isolados
- Usar `beforeEach` para setup e `afterEach` para cleanup
- Evitar operações de I/O desnecessárias

## Debugging

### Executar Testes em Modo Debug
```bash
npm run test:debug
```

### Logs de Teste
```typescript
describe('YourService', () => {
  it('should do something', () => {
    console.log('Debug info');
    expect(true).toBe(true);
  });
});
```

## CI/CD

### GitHub Actions (exemplo)
```yaml
- name: Run Tests
  run: |
    cd companies-service/backend
    npm install
    npm run test:all
```

### Pipeline de Deploy
```bash
# Verificar se todos os testes passam antes do deploy
npm run test:all
```

## Troubleshooting

### Problemas Comuns

1. **Testes falhando por timeout**
   - Aumentar `testTimeout` no `jest.config.js`
   - Verificar se mocks estão configurados corretamente

2. **Erro de módulo não encontrado**
   - Verificar se o caminho do import está correto
   - Verificar se o arquivo existe

3. **Testes de integração falhando**
   - Verificar se o banco de dados está rodando
   - Verificar se as variáveis de ambiente estão configuradas

4. **Cobertura baixa**
   - Adicionar testes para branches não cobertos
   - Verificar se arquivos estão sendo excluídos incorretamente 