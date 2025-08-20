import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3ClientService {
  private readonly logger = new Logger(S3ClientService.name);
  private s3: AWS.S3;

  constructor() {
    this.initializeS3Client();
  }

  private initializeS3Client(): void {
    const config: AWS.S3.ClientConfiguration = {
      endpoint: process.env.ENDPOINT_URL,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      s3ForcePathStyle: true, // Necessário para compatibilidade com MinIO
      signatureVersion: 'v4',
    };

    this.s3 = new AWS.S3(config);
  }

  /**
   * Faz upload de um arquivo para o S3
   * @param filePath - Caminho local do arquivo
   * @param bucketName - Nome do bucket de destino
   * @param key - Chave (nome) do arquivo no S3 (opcional, usa o nome do arquivo se não fornecido)
   * @returns Path do arquivo no S3 (sem protocolo, domínio e porta)
   */
  async uploadFile(
    filePath: string,
    bucketName: string,
    key?: string,
  ): Promise<string> {
    try {
      // Verifica se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      // Cria o bucket se não existir
      await this.ensureBucketExists(bucketName);

      // Define a chave do arquivo no S3
      const s3Key = key || path.basename(filePath);

      // Lê o arquivo
      const fileContent = fs.readFileSync(filePath);
      const contentType = this.getContentType(filePath);

      // Parâmetros para upload
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
        ACL: 'public-read', // Torna o arquivo público
      };

      // Faz o upload
      const result = await this.s3.upload(uploadParams).promise();

      this.logger.log(
        `Arquivo ${filePath} enviado com sucesso para ${bucketName}/${s3Key}`,
      );

      // Retorna apenas o path do arquivo (sem protocolo, domínio e porta)
      return `/${bucketName}/${s3Key}`;
    } catch (error) {
      this.logger.error(`Erro ao fazer upload do arquivo ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Configura política pública para um bucket
   * @param bucketName - Nome do bucket
   */
  private async setBucketPublicPolicy(bucketName: string): Promise<void> {
    try {
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
          },
        ],
      };

      await this.s3
        .putBucketPolicy({
          Bucket: bucketName,
          Policy: JSON.stringify(bucketPolicy),
        })
        .promise();

      this.logger.log(
        `Política pública configurada para o bucket ${bucketName}`,
      );
    } catch (error) {
      this.logger.warn(
        `Não foi possível configurar política pública para ${bucketName}:`,
        error,
      );
    }
  }

  /**
   * Verifica se o bucket existe e cria se necessário
   * @param bucketName - Nome do bucket
   */
  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      // Verifica se o bucket existe
      await this.s3.headBucket({ Bucket: bucketName }).promise();
      this.logger.log(`Bucket ${bucketName} já existe`);

      // Garante que o bucket tenha política pública
      await this.setBucketPublicPolicy(bucketName);
    } catch (error) {
      if (error.statusCode === 404) {
        // Bucket não existe, cria ele
        try {
          await this.s3.createBucket({ Bucket: bucketName }).promise();
          this.logger.log(`Bucket ${bucketName} criado com sucesso`);

          // Configura política pública para o bucket
          await this.setBucketPublicPolicy(bucketName);
        } catch (createError) {
          this.logger.error(`Erro ao criar bucket ${bucketName}:`, createError);
          throw createError;
        }
      } else {
        this.logger.error(`Erro ao verificar bucket ${bucketName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Determina o content type baseado na extensão do arquivo
   * @param filePath - Caminho do arquivo
   * @returns Content type do arquivo
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    const contentTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Gera uma URL pré-assinada para acesso temporário ao arquivo
   * @param bucketName - Nome do bucket
   * @param key - Chave do arquivo no S3
   * @param expires - Tempo de expiração em segundos (padrão: 3600 = 1 hora)
   * @returns URL pré-assinada
   */
  async getPresignedUrl(
    bucketName: string,
    key: string,
    expires: number = 3600,
  ): Promise<string> {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
        Expires: expires,
      };

      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      this.logger.error(
        `Erro ao gerar URL pré-assinada para ${bucketName}/${key}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Deleta um arquivo do S3
   * @param bucketName - Nome do bucket
   * @param key - Chave do arquivo no S3
   */
  async deleteFile(bucketName: string, key: string): Promise<void> {
    try {
      await this.s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
      this.logger.log(`Arquivo ${bucketName}/${key} deletado com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao deletar arquivo ${bucketName}/${key}:`, error);
      throw error;
    }
  }
}
