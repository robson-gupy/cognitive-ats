import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { AsyncTaskQueue } from '../interfaces/async-task-queue.interface';

/**
 * Implementação funcional do Redis Task Queue Service
 * Usa Redis CLI para envio de mensagens para filas
 */
@Injectable()
export class RedisTaskQueueService implements AsyncTaskQueue, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisTaskQueueService.name);
  private redisClient: RedisClientType;

  constructor() {
    // Configuração do Redis será feita no onModuleInit
  }

  async onModuleInit() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://redis:6379/0';
      
      this.redisClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Conectado ao Redis com sucesso');
      });

      await this.redisClient.connect();
      this.logger.log('Redis Task Queue Service inicializado');
    } catch (error) {
      this.logger.error('Erro ao conectar com Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.disconnect();
      this.logger.log('Conexão Redis fechada');
    }
  }

  async sendMessage(queueName: string, messageBody: Record<string, unknown>): Promise<void> {
    try {
      if (!this.redisClient || !this.redisClient.isReady) {
        throw new Error('Redis client não está conectado');
      }

      const message = JSON.stringify(messageBody);
      
      // Usar LPUSH para adicionar mensagem ao final da fila
      await this.redisClient.lPush(queueName, message);
      
      this.logger.log(
        `Mensagem enviada para fila Redis ${queueName} com sucesso. Tamanho da fila: ${await this.redisClient.lLen(queueName)}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem para fila Redis ${queueName}:`,
        error,
      );
      throw error;
    }
  }

  async sendApplicationCreatedMessage(
    applicationId: string,
    resumeUrl: string,
  ): Promise<void> {
    const queueName =
      process.env.APPLICATIONS_REDIS_QUEUE_NAME || 
      process.env.APPLICATIONS_QUEUE_NAME ||
      'applications-queue';

    const messageBody = {
      applicationId,
      resumeUrl,
      eventType: 'APPLICATION_CREATED',
      timestamp: new Date().toISOString(),
    };

    await this.sendMessage(queueName, messageBody);
  }

  async sendQuestionResponseMessage(
    applicationId: string,
    questionId: string,
    response: string,
  ): Promise<void> {
    const queueName =
      process.env.QUESTION_RESPONSES_REDIS_QUEUE_NAME || 
      process.env.QUESTION_RESPONSES_QUEUE_NAME ||
      'question-responses-queue';

    const messageBody = {
      applicationId,
      questionId,
      response,
      eventType: 'QUESTION_RESPONSE_CREATED',
      timestamp: new Date().toISOString(),
    };

    await this.sendMessage(queueName, messageBody);
  }

  /**
   * Método utilitário para verificar o status da conexão Redis
   */
  async getConnectionStatus(): Promise<{ connected: boolean; queueSizes: Record<string, number> }> {
    try {
      if (!this.redisClient || !this.redisClient.isReady) {
        return { connected: false, queueSizes: {} };
      }

      const applicationsQueue = process.env.APPLICATIONS_REDIS_QUEUE_NAME || 
        process.env.APPLICATIONS_QUEUE_NAME ||
        'applications-queue';
      
      const questionResponsesQueue = process.env.QUESTION_RESPONSES_REDIS_QUEUE_NAME || 
        process.env.QUESTION_RESPONSES_QUEUE_NAME ||
        'question-responses-queue';

      const queueSizes = {
        [applicationsQueue]: await this.redisClient.lLen(applicationsQueue),
        [questionResponsesQueue]: await this.redisClient.lLen(questionResponsesQueue),
      };

      return { connected: true, queueSizes };
    } catch (error) {
      this.logger.error('Erro ao verificar status da conexão Redis:', error);
      return { connected: false, queueSizes: {} };
    }
  }
}