import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { ApplicationStageService } from './application-stage.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationScoreDto } from './dto/update-application-score.dto';
import { ChangeApplicationStageDto } from './dto/change-application-stage.dto';
import { UploadResumeDto } from './dto/upload-resume.dto';
import { UpdateApplicationEvaluationDto } from './dto/update-application-evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { CandidateEvaluationService } from './candidate-evaluation.service';

@Controller('jobs/:jobId/applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly applicationStageService: ApplicationStageService,
    private readonly candidateEvaluationService: CandidateEvaluationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('jobId') jobId: string,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    // Garantir que o jobId da URL seja usado
    createApplicationDto.jobId = jobId;
    return this.applicationsService.create(createApplicationDto);
  }

  @Post('upload-resume')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('resume'))
  async createWithResume(
    @Param('jobId') jobId: string,
    @Body() uploadResumeDto: UploadResumeDto,
    @UploadedFile() resumeFile: any,
  ) {
    // Criar um objeto com jobId para passar ao serviço
    const createApplicationDto = {
      ...uploadResumeDto,
      jobId,
    };
    return this.applicationsService.createWithResume(
      createApplicationDto,
      resumeFile,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async findAll(@Param('jobId') jobId: string, @Request() req) {
    const companyId = req.user.companyId;
    return this.applicationsService.findByJobId(jobId, companyId);
  }

  @Get('with-question-responses')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async findAllWithQuestionResponses(
    @Param('jobId') jobId: string,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationsService.findByJobIdWithQuestionResponses(
      jobId,
      companyId,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async findOne(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationsService.findOneByJobId(id, jobId, companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async update(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationsService.updateByJobId(
      id,
      jobId,
      updateApplicationDto,
      companyId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationsService.removeByJobId(id, jobId, companyId);
  }

  @Patch(':id/ai-score')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async updateAiScore(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Body() updateScoreDto: UpdateApplicationScoreDto,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationsService.updateAiScoreByJobId(
      id,
      jobId,
      updateScoreDto,
      companyId,
    );
  }

  @Patch(':id/change-stage')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async changeStage(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Body() changeStageDto: ChangeApplicationStageDto,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationStageService.changeStage(
      id,
      jobId,
      companyId,
      changeStageDto,
      req.user,
    );
  }

  @Get(':id/stage-history')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async getStageHistory(
    @Param('jobId') jobId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationStageService.getStageHistory(
      id,
      jobId,
      companyId,
    );
  }

  @Get('by-stage/:stageId')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async getApplicationsByStage(
    @Param('jobId') jobId: string,
    @Param('stageId') stageId: string,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationStageService.getApplicationsByStage(
      jobId,
      companyId,
      stageId,
    );
  }

  @Post(':id/evaluate')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  async evaluateApplication(
    @Param('id') id: string,
    @Param('jobId') jobId: string,
    @Query('companyId') companyId: string,
  ) {
    // Primeiro verificar se a application existe e pertence à company
    await this.applicationsService.findOneByJobId(id, jobId, companyId);

    // Avaliar a application
    return this.candidateEvaluationService.evaluateApplication(id);
  }
}
