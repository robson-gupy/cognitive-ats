# Question Responses SQS Listener

Este listener consome mensagens da fila SQS `question-responses-queue` e imprime no console as respostas das perguntas da vaga enviadas pelos candidatos.

## 🎯 **Funcionalidade**

O listener recebe eventos quando candidatos respondem perguntas da vaga e exibe no console:

- **Dados da resposta**: ID, pergunta, resposta, timestamps
- **Dados da vaga**: título, descrição, requisitos
- **Dados da empresa**: nome, slug
- **Dados do candidato**: nome, email, telefone
- **Dados da candidatura**: ID, data de criação

## 🚀 **Como Usar**

### 1. **Configuração das Variáveis de Ambiente**

Copie o arquivo de exemplo e configure:

```bash
cp env.consumer.example .env
```

Configure as seguintes variáveis:

```env
# AWS SQS
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1

# Fila SQS para respostas das perguntas
QUESTION_RESPONSES_SQS_QUEUE_NAME=question-responses-queue

# Configurações SQS
SQS_WAIT_TIME=20
SQS_MAX_MESSAGES=10
```

### 2. **Execução Local**

```bash
# Navegar para o diretório do consumer
cd ai-service/consumer

# Instalar dependências (se necessário)
pip install -r ../requirements.txt

# Executar o listener
python question_responses_listener.py
```

### 3. **Execução com Docker**

```bash
# Construir a imagem
docker build -f consumer/Dockerfile.question-responses-listener -t question-responses-listener .

# Executar o container
docker run --env-file consumer/.env question-responses-listener
```

### 4. **Execução com Docker Compose**

```bash
# O serviço já está configurado no docker-compose.yml
docker-compose up sqs-question-responses-listener
```

## 📊 **Estrutura das Mensagens Processadas**

### **Evento Individual**
```
📝 NOVA RESPOSTA DE PERGUNTA RECEBIDA
================================================================================
🎯 Tipo de Evento: QUESTION_RESPONSE_CREATED
⏰ Timestamp: 2024-01-01T12:00:00.000Z

📊 DADOS DA RESPOSTA:
   ID da Resposta: uuid-da-resposta
   ID da Application: uuid-da-application
   ID da Vaga: uuid-da-vaga
   ID da Empresa: uuid-da-empresa
   ID da Pergunta: uuid-da-pergunta
   Pergunta: Qual sua experiência com Python?
   Resposta: Programo em Python há 5 anos
   Criado em: 2024-01-01T12:00:00.000Z

💼 DADOS DA VAGA:
   Título: Desenvolvedor Python
   Slug: desenvolvedor-python
   Descrição: Estamos procurando um desenvolvedor...
   Requisitos: Python, Django, PostgreSQL...

🏢 DADOS DA EMPRESA:
   Nome: TechCorp
   Slug: techcorp

👤 DADOS DO CANDIDATO:
   Nome: João Silva
   Email: joao@email.com
   Telefone: (11) 99999-9999
   Candidatura criada em: 2024-01-01T12:00:00.000Z

================================================================================
✅ MENSAGEM PROCESSADA COM SUCESSO
================================================================================
```

### **Evento Múltiplo**
```
📝 NOVA RESPOSTA DE PERGUNTA RECEBIDA
================================================================================
🎯 Tipo de Evento: MULTIPLE_QUESTION_RESPONSES_CREATED
⏰ Timestamp: 2024-01-01T12:00:00.000Z

📊 DADOS DA RESPOSTA:
   ID da Resposta: uuid-da-resposta
   ID da Application: uuid-da-application
   ID da Vaga: uuid-da-vaga
   ID da Empresa: uuid-da-empresa
   Total de Respostas: 3

📝 RESPOSTAS INDIVIDUAIS:

   1. Pergunta: Qual sua experiência com Python?
      Resposta: Programo em Python há 5 anos
      ID da Pergunta: uuid-pergunta-1
      Criado em: 2024-01-01T12:00:00.000Z

   2. Pergunta: Quais frameworks conhece?
      Resposta: Django, Flask, FastAPI
      ID da Pergunta: uuid-pergunta-2
      Criado em: 2024-01-01T12:00:00.000Z

   3. Pergunta: Como trabalha com bancos de dados?
      Resposta: Tenho experiência com PostgreSQL...
      ID da Pergunta: uuid-pergunta-3
      Criado em: 2024-01-01T12:00:00.000Z

[... resto dos dados da vaga, empresa e candidato ...]
```

## 🧪 **Testes**

### **Script de Teste**

Execute o script de teste para verificar a conectividade:

```bash
python test_question_responses_listener.py
```

Este script:
1. Testa a conexão com a fila SQS
2. Envia uma mensagem de teste
3. Recebe e processa a mensagem
4. Deleta a mensagem após processamento

### **Teste Manual**

1. **Inicie o listener**:
   ```bash
   python question_responses_listener.py
   ```

2. **Em outro terminal, execute o teste**:
   ```bash
   python test_question_responses_listener.py
   ```

3. **Observe o output do listener** para ver a mensagem sendo processada

## 🔧 **Configurações Avançadas**

### **Variáveis de Ambiente Opcionais**

```env
# Timeout para recebimento de mensagens (segundos)
SQS_WAIT_TIME=20

# Número máximo de mensagens por lote
SQS_MAX_MESSAGES=10

# Número máximo de tentativas em caso de erro
SQS_MAX_RETRIES=3
```

### **Configuração de Logs**

O listener usa `print` para output. Para produção, considere:

- Implementar logging estruturado
- Configurar níveis de log
- Integrar com sistemas de monitoramento

## 🚨 **Tratamento de Erros**

### **Erros Comuns**

1. **Fila não encontrada**:
   ```
   ❌ Erro: Fila 'question-responses-queue' não encontrada
      Execute o script setup-localstack.sh para criar a fila
   ```

2. **Credenciais inválidas**:
   ```
   ❌ Erro: Credenciais AWS não encontradas
      Configure as variáveis de ambiente ou use um perfil AWS
   ```

3. **Timeout de conexão**:
   ```
   ❌ Erro do cliente SQS: [erro específico]
   ```

### **Recuperação Automática**

- **Reconexão**: O listener tenta se reconectar automaticamente
- **Retry**: Pausa de 5 segundos em caso de erro
- **Graceful shutdown**: Ctrl+C para parar graciosamente

## 📈 **Monitoramento**

### **Métricas de Performance**

- **Mensagens processadas**: Contador por sessão
- **Tempo de processamento**: Por mensagem
- **Taxa de erro**: Mensagens com falha

### **Logs de Debug**

Para debug avançado, adicione:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔮 **Melhorias Futuras**

### **Funcionalidades Planejadas**

- **Persistência**: Salvar logs em arquivo
- **Métricas**: Prometheus/Grafana integration
- **Filtros**: Processar apenas eventos específicos
- **Batch processing**: Processar múltiplas mensagens de uma vez

### **Integrações**

- **Slack/Teams**: Notificações em tempo real
- **Email**: Relatórios diários
- **Webhooks**: Enviar dados para sistemas externos
- **Analytics**: Dashboard de métricas

## 🆘 **Suporte**

### **Problemas Comuns**

1. **Listener não recebe mensagens**:
   - Verifique se a fila existe
   - Confirme as variáveis de ambiente
   - Teste com o script de teste

2. **Erro de conexão**:
   - Verifique se o LocalStack está rodando
   - Confirme a URL do endpoint
   - Teste a conectividade de rede

3. **Mensagens não são processadas**:
   - Verifique o formato JSON das mensagens
   - Confirme a estrutura esperada
   - Teste com mensagem de teste

### **Contatos**

- **Issues**: Use o sistema de issues do repositório
- **Documentação**: Consulte este README e a documentação principal
- **Logs**: Verifique os logs do container para detalhes de erro

## 📚 **Referências**

- [AWS SQS Documentation](https://docs.aws.amazon.com/sqs/)
- [Boto3 SQS Client](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sqs.html)
- [LocalStack SQS](https://docs.localstack.cloud/aws/sqs/)
- [Docker Compose](https://docs.docker.com/compose/)
