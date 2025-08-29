# Sistema de Tags para Applications

## Visão Geral

Este módulo implementa um sistema de tags reutilizáveis que podem ser adicionadas às applications. As tags permitem categorizar e organizar as applications de forma flexível.

## Estrutura de Dados

### Entidade Tag

A entidade `Tag` representa uma tag reutilizável que pode ser aplicada a múltiplas applications:

- **id**: UUID único da tag
- **companyId**: ID da empresa à qual a tag pertence
- **label**: Nome/texto da tag (único por empresa)
- **color**: Cor de fundo da tag em formato hex (#RRGGBB)
- **textColor**: Cor do texto da tag em formato hex (#RRGGBB)
- **createdAt**: Data de criação da tag
- **updatedAt**: Data da última atualização da tag

### Entidade ApplicationTag

A entidade `ApplicationTag` representa a relação entre uma application e uma tag, incluindo metadados sobre quem adicionou:

- **id**: UUID único da relação
- **applicationId**: Referência para a application
- **tagId**: Referência para a tag
- **addedByUserId**: Referência para o usuário que adicionou a tag
- **createdAt**: Data em que a tag foi adicionada à application

## Relacionamentos

- Uma `Company` pode ter múltiplas `Tag`s (One-to-Many)
- Uma `Tag` pode estar associada a múltiplas `Application`s (One-to-Many através de ApplicationTag)
- Uma `Application` pode ter múltiplas `Tag`s (Many-to-Many através de ApplicationTag)
- Um `User` pode ter adicionado múltiplas tags a applications (One-to-Many através de ApplicationTag)

## Constraints

- **Unicidade**: 
  - Uma tag só pode ser adicionada uma vez por application (constraint único em application_id + tag_id)
  - O nome da tag deve ser único por empresa (constraint único em company_id + label)
- **Integridade Referencial**: 
  - Se uma application for deletada, suas tags são removidas (CASCADE)
  - Se uma tag for deletada, suas associações com applications são removidas (CASCADE)
  - Se uma empresa for deletada, suas tags são removidas (CASCADE)
  - Se um usuário for deletado, as associações de tags que ele adicionou são mantidas (RESTRICT)

## Índices

- **tags.company_id**: Para busca rápida por empresa
- **tags.company_id + label** (único): Para garantir unicidade por empresa
- **application_tags.application_id**: Para buscar todas as tags de uma application
- **application_tags.tag_id**: Para buscar todas as applications que usam uma tag
- **application_tags.added_by_user_id**: Para rastrear ações de usuários

## Migração

### Migração Principal: `1756486983000-CreateTagsAndApplicationTagsTables.ts`
Cria:
1. Tabela `tags` com todos os campos necessários (incluindo company_id)
2. Tabela `application_tags` com as relações e metadados
3. Índices para performance
4. Foreign keys para integridade referencial
5. Constraints únicos para evitar duplicatas

### Migração Adicional: `1756487862000-AddCompanyIdToTags.ts`
Adiciona:
1. Campo `company_id` na tabela `tags`
2. Índice único composto para `company_id + label`
3. Foreign key para `companies` com CASCADE
4. Remove o índice único antigo de `label`

## Uso Futuro

Esta estrutura permite:

- **Filtros**: Buscar applications por tags específicas
- **Agrupamento**: Agrupar applications por tags
- **Auditoria**: Rastrear quem adicionou cada tag
- **Reutilização**: Usar as mesmas tags em múltiplas applications
- **Personalização**: Cores customizáveis para cada tag
- **Isolamento por Empresa**: Cada empresa tem seu próprio conjunto de tags
- **Organização**: Tags organizadas por contexto empresarial
