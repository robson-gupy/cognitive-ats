import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReactSsrService } from './react/react-ssr.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ReactSsrService],
})
export class AppModule {}
