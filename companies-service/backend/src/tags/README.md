# Sistema de Tags para Applications

## Visão Geral

Este módulo implementa um sistema de tags reutilizáveis que podem ser adicionadas às applications. As tags permitem categorizar e organizar as applications de forma flexível.

## Estrutura de Dados

### Entidade Tag

A entidade `Tag` representa uma tag reutilizável que pode ser aplicada a múltiplas applications:

- **id**: UUID único da tag
- **label**: Nome/texto da tag (único)
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

- Uma `Tag` pode estar associada a múltiplas `Application`s (One-to-Many através de ApplicationTag)
- Uma `Application` pode ter múltiplas `Tag`s (Many-to-Many através de ApplicationTag)
- Um `User` pode ter adicionado múltiplas tags a applications (One-to-Many através de ApplicationTag)

## Constraints

- **Unicidade**: Uma tag só pode ser adicionada uma vez por application (constraint único em application_id + tag_id)
- **Integridade Referencial**: 
  - Se uma application for deletada, suas tags são removidas (CASCADE)
  - Se uma tag for deletada, suas associações com applications são removidas (CASCADE)
  - Se um usuário for deletado, as associações de tags que ele adicionou são mantidas (RESTRICT)

## Índices

- **tags.label**: Para busca rápida por nome da tag
- **application_tags.application_id**: Para buscar todas as tags de uma application
- **application_tags.tag_id**: Para buscar todas as applications que usam uma tag
- **application_tags.added_by_user_id**: Para rastrear ações de usuários

## Migração

A migração `1756486983000-CreateTagsAndApplicationTagsTables.ts` cria:

1. Tabela `tags` com todos os campos necessários
2. Tabela `application_tags` com as relações e metadados
3. Índices para performance
4. Foreign keys para integridade referencial
5. Constraints únicos para evitar duplicatas

## Uso Futuro

Esta estrutura permite:

- **Filtros**: Buscar applications por tags específicas
- **Agrupamento**: Agrupar applications por tags
- **Auditoria**: Rastrear quem adicionou cada tag
- **Reutilização**: Usar as mesmas tags em múltiplas applications
- **Personalização**: Cores customizáveis para cada tag
