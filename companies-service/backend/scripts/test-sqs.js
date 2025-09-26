const AWS = require('aws-sdk');

// Configurar AWS SDK
const sqs = new AWS.SQS({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  endpoint: process.env.STORAGE_SERVICE_ENDPOINT || undefined,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

async function testSQSConnection() {
  try {
    console.log('Testando conexão com SQS...');
    console.log('STORAGE_SERVICE_ENDPOINT:', process.env.STORAGE_SERVICE_ENDPOINT);
    console.log('AWS_DEFAULT_REGION:', process.env.AWS_DEFAULT_REGION);
    console.log('APPLICATIONS_QUEUE_NAME:', process.env.APPLICATIONS_QUEUE_NAME);

    // Determinar a URL da fila
    const queueName = process.env.APPLICATIONS_QUEUE_NAME || 'applications-queue';
    let queueUrl;
    
    if (process.env.STORAGE_SERVICE_ENDPOINT) {
      queueUrl = `http://localstack:4566/000000000000/${queueName}`;
    } else {
      queueUrl = `https://sqs.${process.env.AWS_DEFAULT_REGION || 'us-east-1'}.amazonaws.com/${process.env.AWS_ACCOUNT_ID || '000000000000'}/${queueName}`;
    }

    console.log('Queue URL:', queueUrl);

    // Testar envio de mensagem
    const messageBody = {
      test: true,
      message: 'Teste de conectividade SQS',
      timestamp: new Date().toISOString(),
    };

    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
    };

    const result = await sqs.sendMessage(params).promise();
    console.log('✅ Mensagem enviada com sucesso!');
    console.log('MessageId:', result.MessageId);

    // Testar recebimento de mensagem
    const receiveParams = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 1,
    };

    const receiveResult = await sqs.receiveMessage(receiveParams).promise();
    console.log('✅ Mensagem recebida com sucesso!');
    console.log('Mensagens recebidas:', receiveResult.Messages?.length || 0);

    if (receiveResult.Messages && receiveResult.Messages.length > 0) {
      // Deletar a mensagem de teste
      const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: receiveResult.Messages[0].ReceiptHandle,
      };
      await sqs.deleteMessage(deleteParams).promise();
      console.log('✅ Mensagem de teste deletada!');
    }

  } catch (error) {
    console.error('❌ Erro ao testar SQS:', error.message);
    console.error('Detalhes:', error);
  }
}

testSQSConnection(); 