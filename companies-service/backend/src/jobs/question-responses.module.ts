import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionResponsesService } from './question-responses.service';
import { QuestionResponsesController } from './question-responses.controller';
import { ApplicationQuestionResponse } from './entities/application-question-response.entity';
import { JobQuestion } from './entities/job-question.entity';
import { Application } from './entities/application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationQuestionResponse,
      JobQuestion,
      Application,
    ]),
  ],
  controllers: [QuestionResponsesController],
  providers: [QuestionResponsesService],
  exports: [QuestionResponsesService],
})
export class QuestionResponsesModule {} 