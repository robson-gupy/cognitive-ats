import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionResponsesService } from './services/question-responses.service';
import { QuestionResponsesController } from './controllers/question-responses.controller';
import { ApplicationQuestionResponse } from './entities/application-question-response.entity';
import { Application } from './entities/application.entity';
import { JobQuestion } from '../jobs/entities/job-question.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationQuestionResponse,
      Application,
      JobQuestion,
    ]),
    SharedModule,
  ],
  controllers: [QuestionResponsesController],
  providers: [QuestionResponsesService],
  exports: [QuestionResponsesService],
})
export class QuestionResponsesModule {}
