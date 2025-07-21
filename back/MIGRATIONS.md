# Sistema de Migrações - Cognitive ATS

Este projeto utiliza TypeORM para gerenciar migrações de banco de dados PostgreSQL.

## Comandos Disponíveis

### Executar Migrações
```bash
npm run migration:run
```

### Reverter Última Migração
```bash
npm run migration:revert
```

### Gerar Nova Migração
```bash
npm run migration:generate src/migrations/NomeDaMigracao
```

### Ver Status das Migrações
```bash
npm run migration:show
```

## Estrutura de Migrações

As migrações ficam em `src/migrations/` e seguem o padrão:
- `{timestamp}-{nome}.ts`

Exemplo: `1700000000000-CreateUsersTable.ts`

## Como Criar uma Nova Migração

1. **Automaticamente (recomendado):**
   ```bash
   npm run migration:generate src/migrations/CreateNovaTabela
   ```

2. **Manualmente:**
   - Crie um arquivo em `src/migrations/`
   - Use o timestamp atual como prefixo
   - Implemente `MigrationInterface`

## Exemplo de Migração

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Código para criar/modificar tabela
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Código para reverter mudanças
  }
}
```

## Configuração

O arquivo `ormconfig.ts` contém a configuração do TypeORM para migrações.

## Docker

No ambiente Docker, as migrações são executadas automaticamente antes de iniciar a aplicação.

## Boas Práticas

1. **Sempre teste migrações** antes de fazer deploy
2. **Use `down()`** para reverter mudanças
3. **Mantenha migrações pequenas** e focadas
4. **Documente mudanças** complexas
5. **Nunca edite migrações** já executadas em produção 