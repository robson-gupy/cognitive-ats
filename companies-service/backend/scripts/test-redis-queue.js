#!/usr/bin/env node

/**
 * Script de teste para o Redis Task Queue Service
 * Demonstra o funcionamento básico do sistema de filas Redis
 */

const { createClient } = require('redis');

async function testRedisQueue() {
  console.log('🚀 Iniciando teste do Redis Task Queue Service...\n');

  // Configuração do Redis
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
  const client = createClient({ url: redisUrl });

  try {
    // Conectar ao Redis
    console.log('📡 Conectando ao Redis...');
    await client.connect();
    console.log('✅ Conectado ao Redis com sucesso!\n');

    // Teste 1: Enviar mensagem para fila de aplicações
    console.log('📤 Teste 1: Enviando mensagem para fila de aplicações...');
    const applicationMessage = {
      applicationId: 'test-app-123',
      resumeUrl: 'https://example.com/resume.pdf',
      eventType: 'APPLICATION_CREATED',
      timestamp: new Date().toISOString(),
    };

    await client.lPush('applications-queue', JSON.stringify(applicationMessage));
    console.log('✅ Mensagem de aplicação enviada!\n');

    // Teste 2: Enviar mensagem para fila de respostas de questões
    console.log('📤 Teste 2: Enviando mensagem para fila de respostas de questões...');
    const questionResponseMessage = {
      applicationId: 'test-app-123',
      questionId: 'question-456',
      response: 'Esta é uma resposta de teste',
      eventType: 'QUESTION_RESPONSE_CREATED',
      timestamp: new Date().toISOString(),
    };

    await client.lPush('question-responses-queue', JSON.stringify(questionResponseMessage));
    console.log('✅ Mensagem de resposta de questão enviada!\n');

    // Teste 3: Verificar tamanhos das filas
    console.log('📊 Teste 3: Verificando tamanhos das filas...');
    const applicationsQueueSize = await client.lLen('applications-queue');
    const questionResponsesQueueSize = await client.lLen('question-responses-queue');

    console.log(`📋 Tamanho da fila 'applications-queue': ${applicationsQueueSize}`);
    console.log(`📋 Tamanho da fila 'question-responses-queue': ${questionResponsesQueueSize}\n`);

    // Teste 4: Consumir uma mensagem (simular consumer)
    console.log('📥 Teste 4: Consumindo mensagem da fila de aplicações...');
    const consumedMessage = await client.rPop('applications-queue');
    
    if (consumedMessage) {
      const parsedMessage = JSON.parse(consumedMessage);
      console.log('✅ Mensagem consumida:', JSON.stringify(parsedMessage, null, 2));
    } else {
      console.log('⚠️  Nenhuma mensagem encontrada na fila');
    }

    console.log('\n🎉 Todos os testes concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    // Fechar conexão
    await client.disconnect();
    console.log('\n👋 Conexão Redis fechada.');
  }
}

// Executar testes
testRedisQueue().catch(console.error);
