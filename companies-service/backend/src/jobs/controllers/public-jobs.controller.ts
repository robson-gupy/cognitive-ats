import {
  Controller,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { CompaniesService } from '../../companies/companies.service';
import {
  PublicJobsResponseDto,
  PublicJobResponseDto,
  PublicJobQuestionsResponseDto,
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
  ): Promise<PublicJobsResponseDto> {
    // Validar se o slug é válido (apenas letras, números e hífens)
    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
      throw new BadRequestException('Slug da empresa inválido');
    }

    try {
      // Verificar se a empresa existe pelo slug
      const company = await this.companiesService.findBySlug(slug);

      // Buscar vagas publicadas usando o ID da empresa
      const jobs = await this.jobsService.findPublishedJobsByCompany(
        company.id,
      );

      return {
        success: true,
        data: jobs,
        total: jobs.length,
        companyId: company.id,
        message:
          jobs.length > 0
            ? 'Vagas encontradas com sucesso'
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
      const job = await this.jobsService.findPublicJobBySlug(companySlug, jobSlug);

      return {
        success: true,
        data: questions,
        total: questions.length,
        jobId: job.id,
        message: questions.length > 0 
          ? 'Questions da vaga encontradas com sucesso'
          : 'Nenhuma question encontrada para esta vaga',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Vaga não encontrada ou não pertence à empresa especificada`,
        );
      }
      throw new NotFoundException(`Erro ao buscar questions da vaga: ${error.message}`);
    }
  }
}
