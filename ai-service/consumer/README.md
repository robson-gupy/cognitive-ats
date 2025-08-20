# Processamento de Currículos via SQS

Este módulo implementa um sistema de processamento assíncrono de currículos usando Amazon SQS e OpenAI.

## Funcionalidades

- **Listener SQS**: Escuta mensagens de uma fila SQS
- **Download de PDFs**: Faz download automático de currículos de URLs
- **Processamento com IA**: Usa OpenAI para extrair informações estruturadas
- **Tratamento de Erros**: Sistema robusto de tratamento de falhas
- **Limpeza Automática**: Remove arquivos temporários após processamento

## Arquivos

- `sqs_listener.py`: Listener principal que processa mensagens
- `test_message_sender.py`: Script para enviar mensagens de teste
- `example_message.json`: Exemplo de mensagem JSON esperada

## Configuração

### Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```bash
# AWS SQS
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
APPLICATIONS_SQS_QUEUE_NAME=applications-queue

# OpenAI
OPENAI_API_KEY=sua-chave-api-openai

# Backend
BACKEND_URL=http://localhost:3000
```

### Dependências

Instale as dependências:

```bash
pip install -r requirements.txt
```

## Uso

### 1. Executar o Listener

```bash
cd ai-service/consumer
python sqs_listener.py
```

O listener irá:
- Conectar à fila SQS
- Aguardar mensagens
- Processar currículos automaticamente
- Exibir logs detalhados

### 2. Enviar Mensagem de Teste

```bash
cd ai-service/consumer
python test_message_sender.py
```

### 3. Formato da Mensagem

As mensagens devem ter o seguinte formato JSON:

```json
{
  "resumeUrl": "/resumes/resume.pdf",
  "applicationId": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2024-01-15T10:30:00Z",
  "priority": "high"
}
```

**Nota sobre `resumeUrl`:**
- **Path relativo** (ex: `/resumes/resume.pdf`): O sistema constrói automaticamente a URL completa usando a variável de ambiente `AWS_ENDPOINT_URL`
- **URL completa** (ex: `https://s3.amazonaws.com/bucket/resume.pdf`): Usada diretamente pelo sistema

Para desenvolvimento local, o `AWS_ENDPOINT_URL` deve ser configurado como `http://localhost:4566` (LocalStack).

## Fluxo de Processamento

1. **Recebimento**: Listener recebe mensagem da fila SQS
2. **Validação**: Verifica se a mensagem contém `resumeUrl` e `applicationId`
3. **Download**: Faz download do PDF da URL fornecida
4. **Processamento**: Usa OpenAI para extrair informações do currículo
5. **Estruturação**: Converte para o modelo `Resume`
6. **Envio ao Backend**: Envia dados processados para o endpoint de criação de resumo
7. **Limpeza**: Remove arquivo temporário
8. **Log**: Registra resultado do processamento

## Logs e Monitoramento

O sistema gera logs detalhados:

```
🎧 Iniciando escuta da fila: http://localhost:4566/000000000000/applications-queue
✅ Serviço de IA inicializado
⏳ Aguardando mensagens de currículo... (Ctrl+C para parar)
--------------------------------------------------
📨 1 mensagem(s) recebida(s)
==================================================
📝 Processando mensagem #1:
   ID: 12345678-1234-1234-1234-123456789012
   Receipt Handle: AQEB...
   Corpo: {"resumeUrl": "/resumes/resume.pdf", "applicationId": "..."}
🔄 Mensagem de currículo detectada!
📥 Fazendo download do PDF: http://localhost:4566/resumes/resume.pdf
✅ PDF salvo em: /tmp/tmp123456.pdf
🔄 Processando currículo para aplicação: test-application-123
✅ Currículo processado com sucesso!
```

## Tratamento de Erros

O sistema trata os seguintes tipos de erro:

- **Erro de conexão SQS**: Reconecta automaticamente
- **Erro de download**: Registra falha e continua
- **Erro de processamento IA**: Registra erro específico
- **Arquivo corrompido**: Detecta e reporta problema
- **Timeout**: Configurado para 30 segundos por operação

## Integração

### Com o Sistema Principal

O resultado do processamento pode ser:

1. **Salvo no banco de dados**:
```python
# Exemplo de integração
resume_data = result['resume']
# Salvar no banco usando o ORM
```

2. **Enviado para outra fila**:
```python
# Exemplo de envio para fila de resultados
sqs_client.send_message(
    QueueUrl=results_queue_url,
    MessageBody=json.dumps(result)
)
```

3. **Notificação via webhook**:
```python
# Exemplo de webhook
requests.post(webhook_url, json=result)
```

### Com APIs REST

O sistema pode ser integrado com APIs REST:

```python
# Exemplo de chamada para API
response = requests.post(
    f"{api_base_url}/applications/{application_id}/resume",
    json=resume_data
)
```

## Monitoramento e Métricas

### Logs Estruturados

Os logs incluem:
- Timestamp de cada operação
- IDs de mensagem e aplicação
- Status de sucesso/falha
- Tempo de processamento
- Detalhes de erro

### Métricas Sugeridas

Monitore:
- Taxa de processamento (mensagens/segundo)
- Taxa de erro
- Tempo médio de processamento
- Uso de memória e CPU
- Latência de download

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão SQS**:
   - Verifique variáveis de ambiente
   - Confirme se a fila existe
   - Teste conectividade

2. **Erro de download**:
   - Verifique se a URL é acessível
   - Confirme se o arquivo é um PDF válido
   - Teste timeout de rede

3. **Erro de OpenAI**:
   - Verifique API key
   - Confirme quota disponível
   - Teste conectividade com OpenAI

4. **Erro de processamento**:
   - Verifique se o PDF contém texto
   - Confirme formato do currículo
   - Teste com PDFs simples primeiro

### Comandos de Debug

```bash
# Testar conectividade SQS
python -c "import boto3; print('SQS OK')"

# Testar OpenAI
python -c "import openai; print('OpenAI OK')"

# Testar download (usando path relativo)
curl -I http://localhost:4566/resumes/resume.pdf
```

## Desenvolvimento

### Adicionando Novos Processadores

Para adicionar novos tipos de processamento:

1. Crie nova função de processamento
2. Adicione validação na mensagem
3. Integre com o listener principal

```python
async def process_custom_message(message_data, ai_service):
    # Seu processamento customizado
    pass

# No listener
if 'customField' in body_json:
    result = await process_custom_message(body_json, ai_service)
```

### Testes

Execute os testes:

```bash
# Teste de envio
python test_message_sender.py

# Teste de listener
python sqs_listener.py
``` 