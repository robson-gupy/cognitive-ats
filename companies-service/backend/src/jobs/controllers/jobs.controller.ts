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
} from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { CreateJobWithAiDto } from '../dto/create-job-with-ai.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobsService.create(createJobDto, req.user);
  }

  @Post('with-ai')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  createWithAi(@Body() createJobWithAiDto: CreateJobWithAiDto, @Request() req) {
    console.log('Controller - Creating job with AI:', req.user);
    return this.jobsService.createWithAi(createJobWithAiDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  findAll(@Request() req) {
    return this.jobsService.findAll(req.user.companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.jobsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req,
  ) {
    return this.jobsService.update(id, updateJobDto, req.user);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  publish(@Param('id') id: string, @Request() req) {
    return this.jobsService.publish(id, req.user);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  close(@Param('id') id: string, @Request() req) {
    return this.jobsService.close(id, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    await this.jobsService.remove(id, req.user.companyId);
    return { message: 'Vaga excluída com sucesso' };
  }

  @Get(':id/logs')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  getLogs(@Param('id') id: string, @Request() req) {
    return this.jobsService.getLogs(id, req.user.companyId);
  }

  @Get('company/:companyId/published')
  findPublishedJobsByCompany(@Param('companyId') companyId: string) {
    return this.jobsService.findPublishedJobsByCompany(companyId);
  }
}
