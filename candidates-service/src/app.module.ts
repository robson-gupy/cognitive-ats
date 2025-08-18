import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReactSsrService } from './react/react-ssr.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, ReactSsrService],
})
export class AppModule {}
