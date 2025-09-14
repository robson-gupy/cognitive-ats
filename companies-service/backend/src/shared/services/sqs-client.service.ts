import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { AsyncTaskQueue } from '../interfaces/async-task-queue.interface';

// Interface genérica para o corpo da mensagem
interface MessageBody {
  [key: string]: unknown;
}

@Injectable()
export class SqsClientService implements AsyncTaskQueue {
  private readonly logger = new Logger(SqsClientService.name);
  private sqs: AWS.SQS;

  constructor() {
    this.sqs = new AWS.SQS({
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
      endpoint: process.env.STORAGE_SERVICE_ENDPOINT || undefined,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      // Configurações adicionais para LocalStack
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  async sendMessage(
    queueName: string,
    messageBody: Record<string, unknown>,
  ): Promise<void> {
    try {
      // Determinar a URL da fila baseada no ambiente
      let queueUrl: string;
      if (process.env.STORAGE_SERVICE_ENDPOINT) {
        // Ambiente local com LocalStack - usar o nome do serviço do Docker
        queueUrl = `http://localstack:4566/000000000000/${queueName}`;
      } else {
        // Ambiente AWS real
        queueUrl = `https://sqs.${process.env.AWS_DEFAULT_REGION || 'us-east-1'}.amazonaws.com/${process.env.AWS_ACCOUNT_ID || '000000000000'}/${queueName}`;
      }

      const params: AWS.SQS.SendMessageRequest = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(messageBody),
      };

      const result = await this.sqs.sendMessage(params).promise();
      this.logger.log(
        `Mensagem enviada para fila ${queueName} com sucesso. MessageId: ${result.MessageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem para fila ${queueName}:`,
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
      process.env.APPLICATIONS_QUEUE_NAME || 'applications-queue';

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
      process.env.QUESTION_RESPONSES_QUEUE_NAME || 'question-responses-queue';

    const messageBody = {
      applicationId,
      questionId,
      response,
      eventType: 'QUESTION_RESPONSE_CREATED',
      timestamp: new Date().toISOString(),
    };

    await this.sendMessage(queueName, messageBody);
  }
}
