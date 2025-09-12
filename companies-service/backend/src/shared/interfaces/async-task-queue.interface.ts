/**
 * Interface genérica para envio de tarefas assíncronas
 * Abstrai a tecnologia específica de fila (SQS, Redis, RabbitMQ, etc.)
 */
export interface AsyncTaskQueue {
  /**
   * Envia uma mensagem genérica para uma fila
   * @param queueName Nome da fila de destino
   * @param messageBody Corpo da mensagem a ser enviada
   */
  sendMessage(queueName: string, messageBody: Record<string, unknown>): Promise<void>;

  /**
   * Envia mensagem específica para criação de aplicação
   * @param applicationId ID da aplicação criada
   * @param resumeUrl URL do currículo
   */
  sendApplicationCreatedMessage(applicationId: string, resumeUrl: string): Promise<void>;

  /**
   * Envia mensagem específica para resposta de questão
   * @param applicationId ID da aplicação
   * @param questionId ID da questão
   * @param response Resposta fornecida pelo candidato
   */
  sendQuestionResponseMessage(
    applicationId: string,
    questionId: string,
    response: string,
  ): Promise<void>;
}
