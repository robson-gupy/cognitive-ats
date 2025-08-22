import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configurar arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`🚀 Candidates Service rodando na porta ${port}`);
  console.log(`📱 Acesse: http://localhost:${port}`);
  console.log(`📁 Arquivos estáticos servidos de: ${join(__dirname, '..', 'public')}`);
}
bootstrap();
