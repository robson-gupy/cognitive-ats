import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { Job } from '../../jobs/entities/job.entity';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';
import { UpdateApplicationScoreDto } from '../dto/update-application-score.dto';
import { S3ClientService } from '../../shared/services/s3-client.service';
import { SqsClientService } from '../../shared/services/sqs-client.service';
import { CandidateEvaluationService } from './candidate-evaluation.service';
import * as fs from 'fs';
import * as crypto from 'crypto';

// Interface para o arquivo de currículo
export interface ResumeFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class ApplicationsService {
  /**
   * Gera um nome de arquivo aleatório e seguro para evitar enumeração
   * @param originalName Nome original do arquivo
   * @returns Nome de arquivo aleatório com extensão preservada
   */
  private generateSecureFileName(originalName: string): string {
    // Gerar 32 bytes aleatórios (256 bits) e converter para hex
    const randomBytes = crypto.randomBytes(32).toString('hex');

    // Extrair a extensão do arquivo original
    const extension = originalName.includes('.')
      ? originalName.substring(originalName.lastIndexOf('.'))
      : '';

    // Combinar timestamp, bytes aleatórios e extensão
    const timestamp = Date.now();
    return `resume_${timestamp}_${randomBytes}${extension}`;
  }

  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    private s3ClientService: S3ClientService,
    private sqsClientService: SqsClientService,
    private candidateEvaluationService: CandidateEvaluationService,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    // Buscar a job para obter o companyId
    const job = await this.jobsRepository.findOne({
      where: { id: createApplicationDto.jobId },
      select: ['id', 'companyId', 'status'],
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Apenas vagas publicadas podem receber inscrições',
      );
    }

    // Validar que pelo menos email ou phone foi fornecido
    if (!createApplicationDto.email && !createApplicationDto.phone) {
      throw new BadRequestException('Email ou telefone deve ser fornecido');
    }

    // Verificar se já existe uma inscrição com o mesmo email ou phone para esta vaga
    const existingApplication = await this.applicationsRepository.findOne({
      where: [
        {
          jobId: createApplicationDto.jobId,
          email: createApplicationDto.email,
        },
        {
          jobId: createApplicationDto.jobId,
          phone: createApplicationDto.phone,
        },
      ].filter(
        (condition) =>
          (condition.email && createApplicationDto.email) ||
          (condition.phone && createApplicationDto.phone),
      ),
    });

    if (existingApplication) {
      if (existingApplication.email === createApplicationDto.email) {
        throw new BadRequestException(
          'Este email já foi utilizado para se inscrever nesta vaga',
        );
      } else {
        throw new BadRequestException(
          'Este telefone já foi utilizado para se inscrever nesta vaga',
        );
      }
    }

    // Buscar a primeira etapa da vaga para definir como etapa inicial
    const firstStage = await this.jobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.stages', 'stages')
      .where('job.id = :jobId', { jobId: createApplicationDto.jobId })
      .andWhere('stages.isActive = :isActive', { isActive: true })
      .orderBy('stages.orderIndex', 'ASC')
      .getOne();

    const firstStageId = firstStage?.stages?.[0]?.id || undefined;

    const application = this.applicationsRepository.create({
      ...createApplicationDto,
      companyId: job.companyId,
      currentStageId: firstStageId,
    });

    const savedApplication =
      await this.applicationsRepository.save(application);

    return savedApplication;
  }

  async createWithResume(
    createApplicationDto: CreateApplicationDto,
    resumeFile: ResumeFile,
  ): Promise<Application> {
    // Buscar a job para obter o companyId
    const job = await this.jobsRepository.findOne({
      where: { id: createApplicationDto.jobId },
      select: ['id', 'companyId', 'status'],
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Apenas vagas publicadas podem receber inscrições',
      );
    }

    // Validar que pelo menos email ou phone foi fornecido
    if (!createApplicationDto.email && !createApplicationDto.phone) {
      throw new BadRequestException('Email ou telefone deve ser fornecido');
    }

    // Verificar se já existe uma inscrição com o mesmo email ou phone para esta vaga
    const existingApplication = await this.applicationsRepository.findOne({
      where: [
        {
          jobId: createApplicationDto.jobId,
          email: createApplicationDto.email,
        },
        {
          jobId: createApplicationDto.jobId,
          phone: createApplicationDto.phone,
        },
      ].filter(
        (condition) =>
          (condition.email && createApplicationDto.email) ||
          (condition.phone && createApplicationDto.phone),
      ),
    });

    if (existingApplication) {
      if (existingApplication.email === createApplicationDto.email) {
        throw new BadRequestException(
          'Este email já foi utilizado para se inscrever nesta vaga',
        );
      } else {
        throw new BadRequestException(
          'Este telefone já foi utilizado para se inscrever nesta vaga',
        );
      }
    }

    // Validar arquivo PDF
    if (!resumeFile) {
      throw new BadRequestException('Arquivo de currículo é obrigatório');
    }

    if (resumeFile.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são aceitos');
    }

    // Upload do arquivo para S3
    const bucketName = process.env.RESUMES_BUCKET_NAME || 'resumes';
    const fileName = this.generateSecureFileName(resumeFile.originalname);

    // Salvar arquivo temporariamente
    const tempFilePath = `/tmp/${fileName}`;
    fs.writeFileSync(tempFilePath, resumeFile.buffer);

    try {
      const resumeUrl = await this.s3ClientService.uploadFile(
        tempFilePath,
        bucketName,
        fileName,
      );
      // Remover arquivo temporário
      fs.unlinkSync(tempFilePath);

      // Buscar a primeira etapa da vaga para definir como etapa inicial
      const firstStage = await this.jobsRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.stages', 'stages')
        .where('job.id = :jobId', { jobId: createApplicationDto.jobId })
        .andWhere('stages.isActive = :isActive', { isActive: true })
        .orderBy('stages.orderIndex', 'ASC')
        .getOne();

      const firstStageId = firstStage?.stages?.[0]?.id || undefined;

      const application = this.applicationsRepository.create({
        ...createApplicationDto,
        companyId: job.companyId,
        resumeUrl,
        currentStageId: firstStageId,
      });

      const savedApplication =
        await this.applicationsRepository.save(application);

      // Enviar mensagem para SQS após criar a application
      try {
        await this.sqsClientService.sendApplicationCreatedMessage(
          savedApplication.id,
          savedApplication.resumeUrl,
        );
      } catch (error) {
        // Log do erro mas não falhar a criação da application
        console.error('Erro ao enviar mensagem para SQS:', error);
      }

      // Avaliar automaticamente o candidato usando IA
      try {
        await this.candidateEvaluationService.evaluateApplication(
          savedApplication.id,
        );
      } catch (error) {
        // Log do erro mas não falhar a criação da application
        console.error('Erro ao avaliar candidato com IA:', error);
      }

      return savedApplication;
    } catch (error) {
      // Remover arquivo temporário em caso de erro
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  }

  async findAll(companyId: string): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { companyId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithQuestionResponses(
    companyId: string,
  ): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { companyId },
      relations: ['job', 'questionResponses', 'questionResponses.jobQuestion'],
      order: {
        createdAt: 'DESC',
        questionResponses: {
          createdAt: 'ASC',
        },
      },
    });
  }

  async findOne(id: string, companyId: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id, companyId },
      relations: ['job', 'questionResponses', 'questionResponses.jobQuestion'],
      order: {
        questionResponses: {
          createdAt: 'ASC',
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Inscrição não encontrada');
    }

    return application;
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
    companyId: string,
  ): Promise<Application> {
    const application = await this.findOne(id, companyId);

    Object.assign(application, updateApplicationDto);
    return this.applicationsRepository.save(application);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const application = await this.findOne(id, companyId);
    await this.applicationsRepository.remove(application);
  }

  async findByJobId(jobId: string, companyId: string, search?: string): Promise<Application[]> {
    const queryBuilder = this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.currentStage', 'currentStage')
      .where('application.jobId = :jobId', { jobId })
      .andWhere('application.companyId = :companyId', { companyId });

    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(application.firstName) LIKE :search OR LOWER(application.lastName) LIKE :search OR LOWER(application.email) LIKE :search OR application.phone LIKE :search)',
        { search: searchTerm }
      );
    }

    return queryBuilder
      .orderBy('application.createdAt', 'DESC')
      .getMany();
  }

  async findByJobIdWithQuestionResponses(
    jobId: string,
    companyId: string,
    search?: string,
  ): Promise<Application[]> {
    const queryBuilder = this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.currentStage', 'currentStage')
      .leftJoinAndSelect('application.questionResponses', 'questionResponses')
      .leftJoinAndSelect('questionResponses.jobQuestion', 'jobQuestion')
      .where('application.jobId = :jobId', { jobId })
      .andWhere('application.companyId = :companyId', { companyId });

    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(application.firstName) LIKE :search OR LOWER(application.lastName) LIKE :search OR LOWER(application.email) LIKE :search OR application.phone LIKE :search)',
        { search: searchTerm }
      );
    }

    return queryBuilder
      .orderBy('application.createdAt', 'DESC')
      .addOrderBy('questionResponses.createdAt', 'ASC')
      .getMany();
  }

  async findOneByJobId(
    id: string,
    jobId: string,
    companyId: string,
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id, jobId, companyId },
      relations: [
        'job',
        'currentStage',
        'questionResponses',
        'questionResponses.jobQuestion',
      ],
      order: {
        questionResponses: {
          createdAt: 'ASC',
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Inscrição não encontrada');
    }

    return application;
  }

  async updateByJobId(
    id: string,
    jobId: string,
    updateApplicationDto: UpdateApplicationDto,
    companyId: string,
  ): Promise<Application> {
    const application = await this.findOneByJobId(id, jobId, companyId);

    Object.assign(application, updateApplicationDto);
    return this.applicationsRepository.save(application);
  }

  async removeByJobId(
    id: string,
    jobId: string,
    companyId: string,
  ): Promise<void> {
    const application = await this.findOneByJobId(id, jobId, companyId);
    await this.applicationsRepository.remove(application);
  }

  async updateAiScoreByJobId(
    id: string,
    jobId: string,
    updateScoreDto: UpdateApplicationScoreDto,
    companyId: string,
  ): Promise<Application> {
    const application = await this.findOneByJobId(id, jobId, companyId);

    Object.assign(application, updateScoreDto);
    return this.applicationsRepository.save(application);
  }

  async updateAiScore(
    id: string,
    updateScoreDto: UpdateApplicationScoreDto,
    companyId: string,
  ): Promise<Application> {
    const application = await this.findOne(id, companyId);

    Object.assign(application, updateScoreDto);
    return this.applicationsRepository.save(application);
  }
}
