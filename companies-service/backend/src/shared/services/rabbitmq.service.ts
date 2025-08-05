import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      console.log('Conectado ao RabbitMQ');
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

  async publishMessage(routingKey: string, message: any): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const exchange = 'applications';
      
      // Garantir que a exchange existe
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      
      // Publicar mensagem
      const messageBuffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
      });

      console.log(`Mensagem publicada com routing key: ${routingKey}`);
    } catch (error) {
      console.error('Erro ao publicar mensagem:', error);
      throw error;
    }
  }

  async publishApplicationNew(application: any): Promise<void> {
    const message = {
      event: 'application.new',
      timestamp: new Date().toISOString(),
      data: application,
    };

    await this.publishMessage('application.new', message);
  }
} 