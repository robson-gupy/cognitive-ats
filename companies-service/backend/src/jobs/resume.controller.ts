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

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post(':applicationId')
  create(
    @Param('applicationId') applicationId: string,
    @Body() createResumeDto: CreateResumeDto,
  ) {
    return this.resumeService.create(applicationId, createResumeDto);
  }

  @Get('application/:applicationId')
  findByApplicationId(@Param('applicationId') applicationId: string) {
    return this.resumeService.findByApplicationId(applicationId);
  }

  @Get('job/:jobId')
  findByJobId(@Param('jobId') jobId: string) {
    return this.resumeService.findByJobId(jobId);
  }

  @Get('company/:companyId')
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.resumeService.findByCompanyId(companyId);
  }

  @Patch(':applicationId')
  update(
    @Param('applicationId') applicationId: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumeService.update(applicationId, updateResumeDto);
  }

  @Delete(':applicationId')
  remove(@Param('applicationId') applicationId: string) {
    return this.resumeService.remove(applicationId);
  }
}
