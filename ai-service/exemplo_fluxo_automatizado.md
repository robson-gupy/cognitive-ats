# Exemplo de Fluxo Automatizado - CVs → Scores

## 🎯 Visão Geral

O sistema agora funciona de forma **completamente automatizada**! Quando você envia um currículo para a fila de CVs, o sistema automaticamente:

1. ✅ Processa o PDF
2. ✅ Extrai informações com IA
3. 🚀 **Envia automaticamente para a fila de scores**
4. ✅ Calcula scores com IA
5. ✅ Salva tudo no banco de dados

## 🔄 Fluxo Completo

```
📄 PDF do CV → Fila de CVs → Processamento → Fila de Scores → Cálculo de Score → Banco de Dados
     ↓              ↓              ↓              ↓              ↓              ↓
  Upload CV    Listener CVs   Parse + IA   Listener Scores   IA Score    Application
                                 ↓              ↓              ↓
                            Dados Extraídos → Score Calculado → Scores Salvos
```

## 🚀 Como Usar (Método Automatizado)

### 1. Configurar o Sistema

```bash
# Variáveis de ambiente necessárias
export APPLICATIONS_SQS_QUEUE_NAME=applications-queue
export APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME=applications-ai-score-queue
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_REGION=us-east-1
```

### 2. Iniciar os Listeners

```bash
cd ai-service/consumer
python main.py
```

### 3. Enviar APENAS para a Fila de CVs

```bash
# O sistema fará todo o resto automaticamente!
aws --endpoint-url=http://localhost:4566 sqs send-message \
  --queue-url http://localhost:4566/000000000000/applications-queue \
  --message-body '{
    "resumeUrl": "https://exemplo.com/curriculo.pdf",
    "applicationId": "cv-001",
    "jobId": "job-001",
    "companyId": "company-123"
  }'
```

## 📊 Logs do Fluxo Automatizado

### 1. Processamento do CV

```
📝 Processando mensagem
   message_id: 12345
   receive_count: 1

🚀 Calculando score para candidato
   application_id: cv-001
   message_id: 12345

⏳ Aguardando resposta do serviço de IA para parsing do currículo...
   application_id: cv-001
   provider: openai

✅ Resposta recebida do serviço de IA para parsing do currículo
   application_id: cv-001
   response_received: true
   response_length: 2048

✅ Currículo processado com sucesso
   application_id: cv-001
   summary_length: 150
   experiences_count: 3
   formations_count: 2
```

### 2. Envio Automático para Fila de Scores

```
🚀 Enviando dados processados para fila de scores
   application_id: cv-001

✅ Mensagem de score enviada para a fila
   application_id: cv-001
   message_id: msg-67890
   queue_name: applications-ai-score-queue

✅ Dados enviados para fila de scores com sucesso
   application_id: cv-001
   message_id: msg-67890
   queue_name: applications-ai-score-queue

🚀 Currículo enviado para fila de scores
   message_id: 12345
   application_id: cv-001

✅ Mensagem processada com sucesso
   message_id: 12345
   application_id: cv-001
   processing_time: 5.2
```

### 3. Processamento dos Scores

```
📝 Processando mensagem de score
   message_id: msg-67890
   receive_count: 1

🚀 Calculando score para candidato
   application_id: cv-001
   message_id: msg-67890

⏳ Aguardando resposta do serviço de IA...
   application_id: cv-001
   message_id: msg-67890
   provider: openai

🚀 Iniciando geração de texto
   provider: openai
   prompt_length: 2048

⏳ Aguardando resposta da API externa...
   provider: openai
   prompt_length: 2048

✅ Resposta recebida da API externa
   provider: openai
   response_length: 512

✅ Resposta recebida do serviço de IA
   application_id: cv-001
   message_id: msg-67890
   response_received: true

📊 Scores calculados
   application_id: cv-001
   overall_score: 85
   education_score: 90
   experience_score: 80

💾 Atualizando scores no banco de dados...
   application_id: cv-001
   message_id: msg-67890

🔄 Atualizando scores da application cv-001
✅ Scores da application cv-001 atualizados com sucesso
   Overall Score: 85
   Education Score: 90
   Experience Score: 80

✅ Score processado e atualizado com sucesso
   application_id: cv-001
   processing_time: 3.1
```

## 🎯 Vantagens do Fluxo Automatizado

### ✅ **Simplicidade**
- **Uma única mensagem** para iniciar todo o processo
- **Sem coordenação manual** entre filas
- **Processo transparente** e rastreável

### ✅ **Eficiência**
- **Processamento paralelo** dos dois listeners
- **Conversão automática** de formatos de dados
- **Tratamento de erros** em cada etapa

### ✅ **Consistência**
- **Dados sincronizados** entre CV e scores
- **Formato padronizado** para IA
- **Rastreabilidade completa** do processo

### ✅ **Flexibilidade**
- **Método manual** ainda disponível para casos específicos
- **Configuração automática** de dados de vaga
- **Fallback inteligente** para dados ausentes

## 🔧 Configuração Avançada

### Dados de Vaga Personalizados

Se você quiser fornecer dados específicos da vaga, pode modificar o `ScoreQueueService`:

```python
# Em score_queue_service.py
score_queue_result = await score_queue_service.send_score_request(
    application_id=application_id,
    resume_data=resume_data,
    job_data={
        "title": "Desenvolvedor Python Senior",
        "requirements": ["Python", "Django", "PostgreSQL"],
        "education_required": "Bacharelado em Computação",
        "experience_required": "5+ anos"
    }
)
```

### Respostas de Perguntas

Para incluir respostas de perguntas específicas:

```python
score_queue_result = await score_queue_service.send_score_request(
    application_id=application_id,
    resume_data=resume_data,
    question_responses=[
        {
            "question": "Qual sua experiência com testes?",
            "answer": "Uso pytest e tenho experiência com TDD"
        }
    ]
)
```

## 📈 Monitoramento do Fluxo

### Verificar Status das Filas

```bash
# Fila de CVs
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/applications-queue \
  --attribute-names All

# Fila de Scores
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/applications-ai-score-queue \
  --attribute-names All
```

### Logs em Tempo Real

```bash
# Terminal 1: Consumer
cd ai-service/consumer && python main.py

# Terminal 2: Monitorar filas
watch -n 2 'aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes --queue-url http://localhost:4566/000000000000/applications-queue --attribute-names All --region us-east-1 | jq .Attributes.ApproximateNumberOfMessages'
```

## 🚨 Tratamento de Erros

### Cenários de Falha

1. **Falha no processamento do CV**
   - Mensagem mantida na fila de CVs
   - Não envia para fila de scores
   - Retry automático configurado

2. **Falha no envio para fila de scores**
   - CV processado com sucesso
   - Log de warning sobre falha
   - Dados salvos no backend
   - Scores não calculados

3. **Falha no cálculo de scores**
   - Mensagem mantida na fila de scores
   - Retry automático configurado
   - CV já processado e salvo

### Estratégias de Recuperação

- **Retry automático** em todas as etapas
- **Logs detalhados** para debugging
- **Fallback inteligente** para dados ausentes
- **Monitoramento contínuo** do status das filas

## 🎉 Resultado Final

Com o fluxo automatizado, você obtém:

1. **📄 CV processado** com informações extraídas
2. **📊 Scores calculados** automaticamente pela IA
3. **💾 Dados salvos** no banco de dados
4. **🔄 Processo rastreável** com logs completos
5. **⚡ Eficiência máxima** com processamento paralelo

**O sistema agora funciona como uma linha de produção automatizada para processamento de currículos e cálculo de scores!** 🚀
