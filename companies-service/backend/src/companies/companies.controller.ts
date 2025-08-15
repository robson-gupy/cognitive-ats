import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Get('check-slug/:slug')
  @HttpCode(HttpStatus.OK)
  async checkSlugAvailability(@Param('slug') slug: string) {
    const isAvailable = await this.companiesService.checkSlugAvailability(slug);

    if (isAvailable) {
      return { available: true, message: 'Slug disponível' };
    } else {
      return { available: false, message: 'Slug já está em uso' };
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminAuthGuard)
  async remove(@Param('id') id: string) {
    await this.companiesService.remove(id);
    return { message: 'Empresa excluída com sucesso' };
  }
}
