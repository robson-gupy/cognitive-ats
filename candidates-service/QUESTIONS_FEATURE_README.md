# Funcionalidade de Perguntas da Vaga

## Visão Geral

Esta funcionalidade permite que os candidatos respondam perguntas específicas da vaga após submeterem sua candidatura. O sistema exibe as perguntas uma por vez em um modal interativo, permitindo navegação entre elas e envio das respostas.

## Fluxo de Funcionamento

### 1. Candidatura Inicial
- O candidato preenche o formulário de candidatura (nome, email, telefone, currículo opcional)
- Ao submeter, o sistema cria uma `application` no backend
- Se a vaga possuir perguntas, o modal é aberto automaticamente

### 2. Modal de Perguntas
- **Busca de Perguntas**: O sistema busca as perguntas da vaga via endpoint `/public/:companySlug/jobs/:jobSlug/questions`
- **Exibição Sequencial**: As perguntas são exibidas uma por vez, ordenadas por `orderIndex`
- **Navegação**: Botões "Anterior" e "Próxima" permitem navegar entre as perguntas
- **Validação**: Perguntas obrigatórias devem ser respondidas antes de prosseguir

### 3. Envio de Respostas
- **Formato**: As respostas são enviadas via endpoint `/jobs/:jobId/applications/:applicationId/question-responses/multiple`
- **Estrutura**: Array de objetos com `jobQuestionId` e `answer`
- **Sucesso**: Mensagem de confirmação e redirecionamento automático

## Endpoints Utilizados

### Buscar Perguntas da Vaga
```
GET /public/:companySlug/jobs/:jobSlug/questions
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "52a535ba-3dcb-4725-80e4-009dcec569ef",
      "question": "Qual sua experiência com Python?",
      "orderIndex": 1,
      "isRequired": true
    }
  ],
  "total": 1,
  "jobId": "job-uuid",
  "message": "Questions da vaga encontradas com sucesso"
}
```

### Enviar Respostas
```
POST /jobs/:jobId/applications/:applicationId/question-responses/multiple
```

**Corpo da Requisição:**
```json
{
  "responses": [
    {
      "jobQuestionId": "52a535ba-3dcb-4725-80e4-009dcec569ef",
      "answer": "Programo em Python ha 10 anos"
    },
    {
      "jobQuestionId": "958fcf2f-ebd6-4cdf-82da-a5cc9dd31892",
      "answer": "Django / Flask"
    }
  ]
}
```

## Componentes React

### QuestionsModal
- **Props**: `isOpen`, `onClose`, `jobId`, `applicationId`, `companySlug`, `jobSlug`, `onSuccess`
- **Funcionalidades**: 
  - Busca automática de perguntas
  - Navegação entre perguntas
  - Validação de campos obrigatórios
  - Envio de respostas
  - Feedback visual de progresso

### ApplicationForm
- **Integração**: Abre automaticamente o modal após sucesso da candidatura
- **Fluxo**: Formulário → Candidatura → Modal de Perguntas → Sucesso

## Características da Interface

### Design Responsivo
- Modal centralizado com overlay escuro
- Barra de progresso visual
- Contador de perguntas (ex: "Pergunta 2 de 5")
- Botões de navegação intuitivos

### Validação
- Perguntas obrigatórias marcadas com asterisco (*)
- Botão "Próxima" desabilitado até resposta ser preenchida
- Feedback visual para campos obrigatórios

### Estados da Interface
- **Carregando**: Spinner durante busca de perguntas
- **Pergunta Ativa**: Exibição da pergunta atual com campo de resposta
- **Sucesso**: Mensagem de confirmação com ícone de check
- **Erro**: Mensagem de erro com opção de tentar novamente

## Configuração

### Variáveis de Ambiente
```bash
# URL da API do companies-service
COMPANIES_API_URL=http://localhost:3001
```

### Dependências
- React 19+
- Tailwind CSS
- TypeScript

## Testes

### Executar Testes
```bash
# Teste específico do QuestionsModal
npm test -- --testPathPattern=questions-modal.spec.ts

# Todos os testes
npm test
```

### Cobertura de Testes
- Interface do componente
- Estrutura de dados
- Validação de campos obrigatórios

## Exemplo de Uso

### 1. Candidato acessa a vaga
```
http://empresa.jobs.localhost/jobs/desenvolvedor-python
```

### 2. Preenche formulário de candidatura
- Nome: João Silva
- Email: joao@email.com
- Telefone: (11) 99999-9999
- Currículo: opcional

### 3. Submete candidatura
- Sistema cria application
- Modal de perguntas abre automaticamente

### 4. Responde perguntas
- **Pergunta 1**: "Qual sua experiência com Python?"
  - Resposta: "Programo em Python há 10 anos"
- **Pergunta 2**: "Quais frameworks conhece?"
  - Resposta: "Django, Flask, FastAPI"

### 5. Finaliza processo
- Clica em "Concluir"
- Sistema envia respostas
- Mensagem de sucesso
- Redirecionamento automático

## Tratamento de Erros

### Cenários de Erro
- **Falha na busca de perguntas**: Botão "Tentar Novamente"
- **Falha no envio**: Retry automático com feedback visual
- **Timeout de conexão**: Mensagem clara para o usuário

### Recuperação
- Modal pode ser fechado e reaberto
- Dados do formulário são preservados
- Estado da candidatura é mantido

## Melhorias Futuras

### Funcionalidades Planejadas
- **Rascunho**: Salvar respostas parcialmente
- **Edição**: Permitir alterar respostas após envio
- **Preview**: Visualizar todas as respostas antes de enviar
- **Templates**: Perguntas pré-definidas por tipo de vaga

### Otimizações
- **Cache**: Armazenar perguntas localmente
- **Offline**: Suporte para respostas offline
- **Analytics**: Métricas de engajamento com perguntas

## Suporte

Para dúvidas ou problemas com esta funcionalidade, consulte:
- Documentação da API do companies-service
- Logs do sistema
- Testes automatizados
- Issues do repositório
