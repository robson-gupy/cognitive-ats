import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { Job } from './entities/job.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
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
        { jobId: createApplicationDto.jobId, email: createApplicationDto.email },
        { jobId: createApplicationDto.jobId, phone: createApplicationDto.phone },
      ].filter(condition => 
        (condition.email && createApplicationDto.email) || 
        (condition.phone && createApplicationDto.phone)
      ),
    });

    if (existingApplication) {
      if (existingApplication.email === createApplicationDto.email) {
        throw new BadRequestException('Este email já foi utilizado para se inscrever nesta vaga');
      } else {
        throw new BadRequestException('Este telefone já foi utilizado para se inscrever nesta vaga');
      }
    }

    const application = this.applicationsRepository.create({
      ...createApplicationDto,
      companyId: job.companyId,
    });

    return this.applicationsRepository.save(application);
  }

  async findAll(companyId: string): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { companyId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id, companyId },
      relations: ['job'],
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

  async findByJobId(jobId: string, companyId: string): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { jobId, companyId },
      order: { createdAt: 'DESC' },
    });
  }
}
