import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateJobWithAiDto } from './dto/create-job-with-ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    console.log('Controller - User from request:', req.user);
    return this.jobsService.create(createJobDto, req.user);
  }

  @Post('with-ai')
  @UseGuards(AdminAuthGuard)
  createWithAi(@Body() createJobWithAiDto: CreateJobWithAiDto, @Request() req) {
    console.log('Controller - Creating job with AI:', req.user);
    return this.jobsService.createWithAi(createJobWithAiDto, req.user);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  findAll(@Request() req) {
    return this.jobsService.findAll(req.user.companyId);
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.jobsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @Request() req) {
    return this.jobsService.update(id, updateJobDto, req.user);
  }

  @Post(':id/publish')
  @UseGuards(AdminAuthGuard)
  publish(@Param('id') id: string, @Request() req) {
    return this.jobsService.publish(id, req.user);
  }

  @Post(':id/close')
  @UseGuards(AdminAuthGuard)
  close(@Param('id') id: string, @Request() req) {
    return this.jobsService.close(id, req.user);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    await this.jobsService.remove(id, req.user.companyId);
    return { message: 'Vaga excluída com sucesso' };
  }

  @Get(':id/logs')
  @UseGuards(AdminAuthGuard)
  getLogs(@Param('id') id: string, @Request() req) {
    return this.jobsService.getLogs(id, req.user.companyId);
  }
} 