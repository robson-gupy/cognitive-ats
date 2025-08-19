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
      const jobs = await this.jobsService.findPublishedJobsByCompany(company.id);

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

  @Get(':companySlug/jobs/:jobId')
  async findPublicJobById(
    @Param('companySlug') companySlug: string,
    @Param('jobId') jobId: string,
  ): Promise<PublicJobResponseDto> {
    // Validar se o slug é válido (apenas letras, números e hífens)
    if (!companySlug || !/^[a-z0-9-]+$/i.test(companySlug)) {
      throw new BadRequestException('Slug da empresa inválido');
    }

    if (
      !jobId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        jobId,
      )
    ) {
      throw new BadRequestException('ID da vaga inválido');
    }

    try {
      // Verificar se a empresa existe pelo slug
      const company = await this.companiesService.findBySlug(companySlug);

      // Buscar vaga específica
      const job = await this.jobsService.findPublicJobById(companySlug, jobId);

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
}
