import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { CompaniesService } from '../../companies/companies.service';
import {
  PublicJobQuestionsResponseDto,
  PublicJobResponseDto,
  PublicJobsResponseDto,
} from '../dto/public-jobs-response.dto';

@Controller('public')
export class PublicJobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Get(':slug/jobs')
  async findPublicJobsByCompany(
    @Param('slug') slug: string,
    @Query('q') searchQuery?: string,
    @Query('departments') departments?: string,
    @Query('limit') limit?: string,
    @Query('threshold') threshold?: string,
  ): Promise<PublicJobsResponseDto> {
    // Validar se o slug é válido (apenas letras, números e hífens)
    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
      throw new BadRequestException('Slug da empresa inválido');
    }

    try {
      // Verificar se a empresa existe pelo slug
      const company = await this.companiesService.findBySlug(slug);

      let jobs;
      
      // Se há parâmetro de busca, usar busca vetorial
      if (searchQuery) {
        // Converter string de departamentos para array
        const departmentIds = departments ? departments.split(',').map(id => id.trim()) : undefined;
        
        // Converter parâmetros numéricos
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const thresholdNum = threshold ? parseFloat(threshold) : 0.8;
        
        // Usar busca vetorial
        jobs = await this.jobsService.findPublishedJobsByCompanyWithSearch(
          company.id,
          searchQuery,
          departmentIds,
          limitNum,
          thresholdNum
        );
      } else {
        // Busca normal sem filtros
        jobs = await this.jobsService.findPublishedJobsByCompany(company.id);
      }

      return {
        success: true,
        data: jobs,
        total: jobs.length,
        companyId: company.id,
        message:
          jobs.length > 0
            ? searchQuery 
              ? 'Vagas encontradas com busca vetorial'
              : 'Vagas encontradas com sucesso'
            : 'Nenhuma vaga publicada encontrada para esta empresa',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Empresa com slug ${slug} não encontrada`);
      }
      throw new NotFoundException(
        `Erro ao buscar vagas da empresa: ${error.message}`,
      );
    }
  }

  @Get(':companySlug/jobs/:jobSlug')
  async findPublicJobBySlug(
    @Param('companySlug') companySlug: string,
    @Param('jobSlug') jobSlug: string,
  ): Promise<PublicJobResponseDto> {
    // Validar se o slug da empresa é válido (apenas letras, números e hífens)
    if (!companySlug || !/^[a-z0-9-]+$/i.test(companySlug)) {
      throw new BadRequestException('Slug da empresa inválido');
    }

    // Validar se o slug da vaga é válido (apenas letras, números e hífens)
    if (!jobSlug || !/^[a-z0-9-]+$/i.test(jobSlug)) {
      throw new BadRequestException('Slug da vaga inválido');
    }

    try {
      // Verificar se a empresa existe pelo slug
      const company = await this.companiesService.findBySlug(companySlug);

      // Buscar vaga específica pelo slug
      const job = await this.jobsService.findPublicJobBySlug(
        companySlug,
        jobSlug,
      );

      return {
        success: true,
        data: job,
        companyId: company.id,
        message: 'Vaga encontrada com sucesso',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Vaga não encontrada ou não pertence à empresa especificada`,
        );
      }
      throw new NotFoundException(`Erro ao buscar vaga: ${error.message}`);
    }
  }

  @Get(':companySlug/jobs/:jobSlug/questions')
  async findPublicJobQuestions(
    @Param('companySlug') companySlug: string,
    @Param('jobSlug') jobSlug: string,
  ): Promise<PublicJobQuestionsResponseDto> {
    // Validar se o slug da empresa é válido (apenas letras, números e hífens)
    if (!companySlug || !/^[a-z0-9-]+$/i.test(companySlug)) {
      throw new BadRequestException('Slug da empresa inválido');
    }

    // Validar se o slug da vaga é válido (apenas letras, números e hífens)
    if (!jobSlug || !/^[a-z0-9-]+$/i.test(jobSlug)) {
      throw new BadRequestException('Slug da vaga inválido');
    }

    try {
      // Verificar se a empresa existe pelo slug
      const company = await this.companiesService.findBySlug(companySlug);

      // Buscar questions da vaga específica
      const questions = await this.jobsService.findPublicJobQuestionsBySlug(
        companySlug,
        jobSlug,
      );

      // Buscar o ID da job para incluir na resposta
      const job = await this.jobsService.findPublicJobBySlug(
        companySlug,
        jobSlug,
      );

      return {
        success: true,
        data: questions,
        total: questions.length,
        jobId: job.id,
        message:
          questions.length > 0
            ? 'Questions da vaga encontradas com sucesso'
            : 'Nenhuma question encontrada para esta vaga',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Vaga não encontrada ou não pertence à empresa especificada`,
        );
      }
      throw new NotFoundException(
        `Erro ao buscar questions da vaga: ${error.message}`,
      );
    }
  }
}
