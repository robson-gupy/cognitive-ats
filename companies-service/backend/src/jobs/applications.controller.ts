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
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationScoreDto } from './dto/update-application-score.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async findAll(@Request() req) {
    const companyId = req.user.companyId;
    return this.applicationsService.findAll(companyId);
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async findByJobId(@Param('jobId') jobId: string, @Request() req) {
    const companyId = req.user.companyId;
    return this.applicationsService.findByJobId(jobId, companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.user.companyId;
    return this.applicationsService.findOne(id, companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationsService.update(id, updateApplicationDto, companyId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const companyId = req.user.companyId;
    return this.applicationsService.remove(id, companyId);
  }

  @Patch(':id/ai-score')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async updateAiScore(
    @Param('id') id: string,
    @Body() updateScoreDto: UpdateApplicationScoreDto,
    @Request() req,
  ) {
    const companyId = req.user.companyId;
    return this.applicationsService.updateAiScore(id, updateScoreDto, companyId);
  }
}
