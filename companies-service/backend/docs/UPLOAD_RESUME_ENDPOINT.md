# Endpoint de Upload de Currículo

## Visão Geral

O endpoint `/applications/upload-resume` permite criar uma nova inscrição para uma vaga com upload de arquivo PDF do currículo do candidato.

## Configuração

### Variáveis de Ambiente

Adicione a seguinte variável de ambiente ao seu arquivo `.env`:

```env
RESUMES_BUCKET_NAME=resumes
```

Esta variável define o nome do bucket no S3/MinIO onde os currículos serão armazenados.

### Migração do Banco de Dados

Execute a migração para adicionar o campo `resume_url` na tabela de applications:

```bash
npm run migration:run
```

## Uso do Endpoint

### URL
```
POST /applications/upload-resume
```

### Headers
```
Content-Type: multipart/form-data
```

### Body (multipart/form-data)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| jobId | string | Sim | ID da vaga (UUID) |
| firstName | string | Sim | Nome do candidato |
| lastName | string | Sim | Sobrenome do candidato |
| email | string | Não* | Email do candidato |
| phone | string | Não* | Telefone do candidato |
| resume | file | Sim | Arquivo PDF do currículo |

*Pelo menos um dos campos (email ou phone) deve ser fornecido.

### Exemplo de Requisição

```bash
curl -X POST http://localhost:3000/applications/upload-resume \
  -F "jobId=123e4567-e89b-12d3-a456-426614174000" \
  -F "firstName=João" \
  -F "lastName=Silva" \
  -F "email=joao.silva@email.com" \
  -F "resume=@/path/to/resume.pdf"
```

### Exemplo de Resposta

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "companyId": "789e0123-e89b-12d3-a456-426614174002",
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao.silva@email.com",
  "phone": null,
  "resumeUrl": "/resumes/resume_1700000000000_curriculo.pdf",
  "aiScore": null,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Nota:** O campo `resumeUrl` agora retorna apenas o path relativo do arquivo (ex: `/resumes/arquivo.pdf`). 
O Caddyfile está configurado para redirecionar automaticamente as requisições para `/cognitive-ats-uploads/*` 
para o serviço MinIO na porta 9000, mantendo o mesmo path.

## Validações

1. **Vaga**: A vaga deve existir e estar com status "PUBLISHED"
2. **Arquivo**: Apenas arquivos PDF são aceitos
3. **Contato**: Pelo menos email ou telefone deve ser fornecido
4. **Duplicação**: Não pode haver inscrição duplicada com mesmo email ou telefone para a mesma vaga

## Armazenamento

- Os arquivos são armazenados no MinIO no bucket configurado
- O nome do arquivo inclui timestamp para evitar conflitos
- A URL do arquivo é salva no campo `resumeUrl` da application
- Arquivos temporários são automaticamente removidos após o upload

## Tratamento de Erros

| Código | Descrição |
|--------|-----------|
| 400 | Vaga não publicada, arquivo inválido, ou dados inválidos |
| 404 | Vaga não encontrada |
| 409 | Email ou telefone já utilizado para esta vaga |
| 500 | Erro interno do servidor |

## Segurança

- Apenas arquivos PDF são aceitos
- Tamanho máximo de arquivo pode ser configurado no servidor
- URLs dos arquivos são geradas com nomes únicos
- Arquivos temporários são limpos automaticamente 