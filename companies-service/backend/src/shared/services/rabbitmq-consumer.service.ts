import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;

  async onModuleInit() {
    await this.connect();
    await this.setupConsumer();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      console.log('Conectado ao RabbitMQ como consumidor');
    } catch (error) {
      console.error('Erro ao conectar ao RabbitMQ:', error);
      throw error;
    }
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('Desconectado do RabbitMQ');
    } catch (error) {
      console.error('Erro ao desconectar do RabbitMQ:', error);
    }
  }

  private async setupConsumer() {
    try {
      const exchange = 'applications';
      const queue = 'applications-queue';
      const routingKey = 'application.new';

      // Garantir que a exchange existe
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      // Garantir que a fila existe
      await this.channel.assertQueue(queue, { durable: true });

      // Vincular a fila à exchange com a routing key
      await this.channel.bindQueue(queue, exchange, routingKey);

      // Configurar o consumidor
      await this.channel.consume(queue, (msg) => {
        if (msg) {
          try {
            const message = JSON.parse(msg.content.toString());
            console.log('Nova aplicação recebida:', message);

            // Aqui você pode processar a mensagem como necessário
            // Por exemplo, enviar email, notificar administradores, etc.
            this.processApplicationNew(message);

            // Confirmar o processamento da mensagem
            this.channel.ack(msg);
          } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            // Rejeitar a mensagem em caso de erro
            this.channel.nack(msg, false, true);
          }
        }
      });

      console.log('Consumidor configurado para routing key: application.new');
    } catch (error) {
      console.error('Erro ao configurar consumidor:', error);
      throw error;
    }
  }

  private async processApplicationNew(message: any) {
    try {
      const { event, timestamp, data } = message;

      console.log(`Processando evento: ${event}`);
      console.log(`Timestamp: ${timestamp}`);
      console.log(`Dados da aplicação:`, {
        id: data.id,
        jobId: data.jobId,
        companyId: data.companyId,
        email: data.email,
        phone: data.phone,
        name: data.name,
        resumeUrl: data.resumeUrl,
        aiScore: data.aiScore,
        createdAt: data.createdAt,
      });

      // Aqui você pode implementar a lógica específica
      // Por exemplo:
      // - Enviar email de confirmação
      // - Notificar recrutadores
      // - Atualizar dashboards
      // - Processar com IA
    } catch (error) {
      console.error('Erro ao processar aplicação:', error);
    }
  }
}
