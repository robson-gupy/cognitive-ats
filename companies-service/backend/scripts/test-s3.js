const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configuração do S3 para MinIO
const s3 = new AWS.S3({
  endpoint: process.env.ENDPOINT_URL || 'http://localhost:9000',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

async function testS3Connection() {
  try {
    console.log('🧪 Testando conexão com MinIO...');
    
    // Teste 1: Listar buckets
    console.log('\n1. Listando buckets existentes:');
    const buckets = await s3.listBuckets().promise();
    console.log('Buckets encontrados:', buckets.Buckets.map(b => b.Name));
    
    // Teste 2: Criar bucket de teste
    const testBucketName = 'test-bucket-' + Date.now();
    console.log(`\n2. Criando bucket de teste: ${testBucketName}`);
    await s3.createBucket({ Bucket: testBucketName }).promise();
    console.log('✅ Bucket criado com sucesso!');
    
    // Teste 3: Criar arquivo de teste
    const testContent = 'Este é um arquivo de teste para o MinIO!';
    const testFileName = 'test-file.txt';
    console.log(`\n3. Fazendo upload do arquivo: ${testFileName}`);
    
    await s3.putObject({
      Bucket: testBucketName,
      Key: testFileName,
      Body: testContent,
      ContentType: 'text/plain',
    }).promise();
    console.log('✅ Arquivo enviado com sucesso!');
    
    // Teste 4: Listar objetos no bucket
    console.log(`\n4. Listando objetos no bucket ${testBucketName}:`);
    const objects = await s3.listObjects({ Bucket: testBucketName }).promise();
    console.log('Objetos encontrados:', objects.Contents.map(o => o.Key));
    
    // Teste 5: Gerar URL pré-assinada
    console.log('\n5. Gerando URL pré-assinada:');
    const presignedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: testBucketName,
      Key: testFileName,
      Expires: 3600,
    });
    console.log('URL pré-assinada:', presignedUrl);
    
    // Teste 6: Baixar e verificar conteúdo
    console.log('\n6. Baixando arquivo para verificar conteúdo:');
    const downloadedObject = await s3.getObject({
      Bucket: testBucketName,
      Key: testFileName,
    }).promise();
    
    const downloadedContent = downloadedObject.Body.toString();
    console.log('Conteúdo baixado:', downloadedContent);
    console.log('✅ Conteúdo correto!');
    
    // Teste 7: Deletar arquivo
    console.log('\n7. Deletando arquivo de teste:');
    await s3.deleteObject({
      Bucket: testBucketName,
      Key: testFileName,
    }).promise();
    console.log('✅ Arquivo deletado!');
    
    // Teste 8: Deletar bucket
    console.log('\n8. Deletando bucket de teste:');
    await s3.deleteBucket({ Bucket: testBucketName }).promise();
    console.log('✅ Bucket deletado!');
    
    console.log('\n🎉 Todos os testes passaram! O MinIO está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.error('Detalhes:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Verifique se o MinIO está rodando:');
      console.log('   docker-compose up minio');
    }
  }
}

// Executar testes
testS3Connection(); 