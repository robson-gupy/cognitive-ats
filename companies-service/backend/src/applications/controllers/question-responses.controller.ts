import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuestionResponsesService } from '../services/question-responses.service';
import { CreateQuestionResponseDto } from '../dto/create-question-response.dto';
import { CreateMultipleQuestionResponsesDto } from '../dto/create-multiple-question-responses.dto';
import { UpdateQuestionResponseDto } from '../dto/update-question-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('jobs/:jobId/applications/:applicationId/question-responses')
export class QuestionResponsesController {
  constructor(
    private readonly questionResponsesService: QuestionResponsesService,
  ) {}

  @Post()
  create(
    @Param('jobId') jobId: string,
    @Param('applicationId') applicationId: string,
    @Body() createQuestionResponseDto: CreateQuestionResponseDto,
  ) {
    return this.questionResponsesService.create(
      applicationId,
      createQuestionResponseDto,
    );
  }

  @Post('multiple')
  createMultiple(
    @Param('jobId') jobId: string,
    @Param('applicationId') applicationId: string,
    @Body()
    createMultipleQuestionResponsesDto: CreateMultipleQuestionResponsesDto,
  ) {
    return this.questionResponsesService.createMultiple(
      applicationId,
      createMultipleQuestionResponsesDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Param('jobId') jobId: string,
    @Param('applicationId') applicationId: string,
  ) {
    return this.questionResponsesService.findAllByApplication(applicationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('jobId') jobId: string, @Param('id') id: string) {
    return this.questionResponsesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Body() updateQuestionResponseDto: UpdateQuestionResponseDto,
  ) {
    return this.questionResponsesService.update(id, updateQuestionResponseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('jobId') jobId: string, @Param('id') id: string) {
    return this.questionResponsesService.remove(id);
  }
}
