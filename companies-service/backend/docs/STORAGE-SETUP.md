# Configuração do Storage para Desenvolvimento

## Visão Geral

O MinIO é um servidor de armazenamento de objetos compatível com S3 que está configurado no ambiente de desenvolvimento para simular o AWS S3.

## Configuração no Docker Compose

O MinIO está configurado no `docker-compose.yml` com as seguintes configurações:

```yaml
minio:
  image: minio/minio:latest
  container_name: cognitive-ats-minio
  ports:
    - "9000:9000"  # API S3
    - "9001:9001"  # Console Web
  environment:
    - MINIO_ROOT_USER=minioadmin
    - MINIO_ROOT_PASSWORD=minioadmin
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"
```

## Acessos

### Console Web do MinIO
- **URL**: http://localhost:9001
- **Usuário**: minioadmin
- **Senha**: minioadmin

### API S3
- **Endpoint**: http://localhost:9000
- **Access Key**: minioadmin
- **Secret Key**: minioadmin

## Variáveis de Ambiente

As seguintes variáveis estão configuradas no serviço `companies-backend`:

```bash
STORAGE_SERVICE_ENDPOINT=http://minio:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```

## Como usar

### 1. Iniciar o ambiente

```bash
docker-compose up -d
```

### 2. Acessar o console do MinIO

1. Abra http://localhost:9001 no navegador
2. Faça login com:
   - Usuário: `minioadmin`
   - Senha: `minioadmin`

### 3. Criar buckets (opcional)

Você pode criar buckets manualmente através do console web ou deixar que o `S3ClientService` crie automaticamente quando necessário.

### 4. Usar o S3ClientService

O `S3ClientService` já está configurado para usar o MinIO. Exemplo de uso:

```typescript
// No seu serviço
constructor(private s3ClientService: S3ClientService) {}

async uploadDocument(filePath: string): Promise<string> {
  const bucketName = 'meus-documentos';
  const fileUrl = await this.s3ClientService.uploadFile(filePath, bucketName);
  return fileUrl;
}
```

## Funcionalidades

- ✅ Compatibilidade total com AWS S3
- ✅ Console web para gerenciamento
- ✅ Criação automática de buckets
- ✅ URLs pré-assinadas
- ✅ Persistência de dados em volume Docker

## Troubleshooting

### MinIO não inicia
```bash
# Verificar logs
docker-compose logs minio

# Reiniciar o serviço
docker-compose restart minio
```

### Erro de conexão
Verifique se as variáveis de ambiente estão corretas:
```bash
docker-compose exec companies-backend env | grep -E "(STORAGE_SERVICE_ENDPOINT|AWS_ACCESS_KEY|AWS_SECRET_ACCESS)"
```

### Bucket não encontrado
O `S3ClientService` cria buckets automaticamente, mas se houver problemas:
1. Acesse o console web em http://localhost:9001
2. Crie o bucket manualmente
3. Verifique as permissões

## Desenvolvimento Local (sem Docker)

Se você estiver rodando o backend localmente (fora do Docker), configure as variáveis de ambiente:

```bash
export STORAGE_SERVICE_ENDPOINT=http://localhost:9000
export AWS_ACCESS_KEY_ID=minioadmin
export AWS_SECRET_ACCESS_KEY=minioadmin
```

## Limpeza

Para limpar os dados do MinIO:

```bash
# Parar os serviços
docker-compose down

# Remover o volume
docker volume rm cognitive-ats_minio_data

# Reiniciar
docker-compose up -d
``` 