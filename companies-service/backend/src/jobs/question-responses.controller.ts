import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QuestionResponsesService } from './question-responses.service';
import { CreateQuestionResponseDto } from './dto/create-question-response.dto';
import { UpdateQuestionResponseDto } from './dto/update-question-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('applications/:applicationId/question-responses')
export class QuestionResponsesController {
  constructor(
    private readonly questionResponsesService: QuestionResponsesService,
  ) {}

  @Post()
  create(
    @Param('applicationId') applicationId: string,
    @Body() createQuestionResponseDto: CreateQuestionResponseDto,
  ) {
    return this.questionResponsesService.create(
      applicationId,
      createQuestionResponseDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Param('applicationId') applicationId: string) {
    return this.questionResponsesService.findAllByApplication(applicationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.questionResponsesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateQuestionResponseDto: UpdateQuestionResponseDto,
  ) {
    return this.questionResponsesService.update(id, updateQuestionResponseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.questionResponsesService.remove(id);
  }
}
