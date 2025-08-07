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
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';

@Controller('resumes')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  @Post(':applicationId')
  create(
    @Param('applicationId') applicationId: string,
    @Body() createResumeDto: CreateResumeDto,
  ) {
    return this.resumeService.create(applicationId, createResumeDto);
  }

  @Get('application/:applicationId')
  @UseGuards(JwtAuthGuard)
  findByApplicationId(@Param('applicationId') applicationId: string) {
    return this.resumeService.findByApplicationId(applicationId);
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard)
  findByJobId(@Param('jobId') jobId: string) {
    return this.resumeService.findByJobId(jobId);
  }

  @Get('company/:companyId')
  @UseGuards(JwtAuthGuard)
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.resumeService.findByCompanyId(companyId);
  }

  @Patch(':applicationId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('applicationId') applicationId: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumeService.update(applicationId, updateResumeDto);
  }

  @Delete(':applicationId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('applicationId') applicationId: string) {
    return this.resumeService.remove(applicationId);
  }

  @Get('test-scores/:applicationId')
  async testScores(@Param('applicationId') applicationId: string) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      select: [
        'id', 
        'firstName', 
        'lastName', 
        'overallScore', 
        'questionResponsesScore', 
        'educationScore', 
        'experienceScore', 
        'evaluationProvider', 
        'evaluationModel', 
        'evaluatedAt',
        'evaluationDetails'
      ]
    });

    if (!application) {
      return { error: 'Application not found' };
    }

    return {
      message: 'Scores da aplicação',
      application: {
        id: application.id,
        name: `${application.firstName} ${application.lastName}`,
        scores: {
          overall: application.overallScore,
          questionResponses: application.questionResponsesScore,
          education: application.educationScore,
          experience: application.experienceScore,
        },
        evaluation: {
          provider: application.evaluationProvider,
          model: application.evaluationModel,
          evaluatedAt: application.evaluatedAt,
          details: application.evaluationDetails,
        }
      }
    };
  }
}
