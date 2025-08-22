import {Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards,} from '@nestjs/common';
import {JobsService} from '../services/jobs.service';
import {CreateJobDto} from '../dto/create-job.dto';
import {UpdateJobDto} from '../dto/update-job.dto';
import {CreateJobWithAiDto} from '../dto/create-job-with-ai.dto';
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard';
import {AdminAuthGuard} from '../../auth/guards/admin-auth.guard';

// Interface para tipar o request com user
interface AuthenticatedRequest extends Request {
  user: {
    companyId: string;
    id: string;
    companySubDomain: string;
    [key: string]: any;
  };
}

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  create(
    @Body() createJobDto: CreateJobDto,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log('Controller - Creating job:', req.user);
    const user = {
      id: req.user.sub,
      companyId: req.user.companyId,
      company: {
        id: req.user.companyId,
        company: req.user.companySubDomain,
      },
    } as any;
    return this.jobsService.create(createJobDto, user);
  }

  @Post('with-ai')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  createWithAi(
    @Body() createJobWithAiDto: CreateJobWithAiDto,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log('Controller - Creating job with AI:', req.user);
    const user = {
      id: req.user.sub,
      companyId: req.user.companyId,
      company: {
        id: req.user.companyId,
        company: req.user.companySubDomain,
      },
    } as any;
    return this.jobsService.createWithAi(createJobWithAiDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  findAll(@Request() req: AuthenticatedRequest) {
    return this.jobsService.findAll(req.user.companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.jobsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = {
      id: req.user.sub,
      companyId: req.user.companyId,
      company: {
        id: req.user.companyId,
        company: req.user.companySubDomain,
      },
    } as any;
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  publish(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const user = {
      id: req.user.sub,
      companyId: req.user.companyId,
      company: {
        id: req.user.companyId,
        company: req.user.companySubDomain,
      },
    } as any;
    return this.jobsService.publish(id, user);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  close(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const user = {
      id: req.user.sub,
      companyId: req.user.companyId,
      company: {
        id: req.user.companyId,
        company: req.user.companySubDomain,
      },
    } as any;
    return this.jobsService.close(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.jobsService.remove(id, req.user.companyId);
    return {message: 'Vaga excluída com sucesso'};
  }

  @Get(':id/logs')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  getLogs(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.jobsService.getLogs(id, req.user.companyId);
  }

  @Get('company/:companyId/published')
  findPublishedJobsByCompany(@Param('companyId') companyId: string) {
    return this.jobsService.findPublishedJobsByCompany(companyId);
  }
}
