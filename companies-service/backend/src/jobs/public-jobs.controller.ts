import {Controller, Get, Param, NotFoundException, BadRequestException} from '@nestjs/common';
import {JobsService} from './jobs.service';
import {CompaniesService} from '../companies/companies.service';
import {PublicJobsResponseDto, PublicJobResponseDto} from './dto/public-jobs-response.dto';

@Controller('public')
export class PublicJobsController {
    constructor(
        private readonly jobsService: JobsService,
        private readonly companiesService: CompaniesService,
    ) {
    }

    @Get(':companyId/jobs')
    async findPublicJobsByCompany(@Param('companyId') companyId: string): Promise<PublicJobsResponseDto> {
        // Validar se o companyId é um UUID válido
        if (!companyId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
            throw new BadRequestException('ID da empresa inválido');
        }

        try {
            // Verificar se a empresa existe
            await this.companiesService.findOne(companyId);

            // Buscar vagas publicadas
            const jobs = await this.jobsService.findPublishedJobsByCompany(companyId);

            return {
                success: true,
                data: jobs,
                total: jobs.length,
                companyId: companyId,
                message: jobs.length > 0 ? 'Vagas encontradas com sucesso' : 'Nenhuma vaga publicada encontrada para esta empresa'
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Empresa com ID ${companyId} não encontrada`);
            }
            throw new NotFoundException(`Erro ao buscar vagas da empresa: ${error.message}`);
        }
    }

    @Get(':companyId/jobs/:jobId')
    async findPublicJobById(
        @Param('companyId') companyId: string,
        @Param('jobId') jobId: string,
    ): Promise<PublicJobResponseDto> {
        // Validar se os IDs são UUIDs válidos
        if (!companyId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
            throw new BadRequestException('ID da empresa inválido');
        }

        if (!jobId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
            throw new BadRequestException('ID da vaga inválido');
        }

        try {
            // Verificar se a empresa existe
            await this.companiesService.findOne(companyId);

            // Buscar vaga específica
            const job = await this.jobsService.findPublicJobById(companyId, jobId);

            return {
                success: true,
                data: job,
                companyId: companyId,
                message: 'Vaga encontrada com sucesso'
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Vaga não encontrada ou não pertence à empresa especificada`);
            }
            throw new NotFoundException(`Erro ao buscar vaga: ${error.message}`);
        }
    }
}
