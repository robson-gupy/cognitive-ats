import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`🚀 Candidates Service rodando na porta ${port}`);
  console.log(`📱 Acesse: http://localhost:${port}`);
}
bootstrap();
