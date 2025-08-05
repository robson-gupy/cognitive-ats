import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { Application } from './entities/application.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(applicationId: string, createResumeDto: CreateResumeDto): Promise<Resume> {
    // Verificar se a aplicação existe
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    // Verificar se já existe um currículo para esta aplicação
    const existingResume = await this.resumeRepository.findOne({
      where: { applicationId },
    });

    if (existingResume) {
      throw new Error(`Resume already exists for application ${applicationId}`);
    }

    const resume = this.resumeRepository.create({
      applicationId,
      ...createResumeDto,
    });

    return this.resumeRepository.save(resume);
  }

  async findByApplicationId(applicationId: string): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { applicationId },
      relations: [
        'professionalExperiences',
        'academicFormations',
        'achievements',
        'languages',
      ],
    });

    if (!resume) {
      throw new NotFoundException(`Resume not found for application ${applicationId}`);
    }

    return resume;
  }

  async update(applicationId: string, updateResumeDto: UpdateResumeDto): Promise<Resume> {
    const resume = await this.findByApplicationId(applicationId);

    // Atualizar o currículo
    Object.assign(resume, updateResumeDto);

    return this.resumeRepository.save(resume);
  }

  async remove(applicationId: string): Promise<void> {
    const resume = await this.findByApplicationId(applicationId);
    await this.resumeRepository.remove(resume);
  }

  async findByJobId(jobId: string): Promise<Resume[]> {
    return this.resumeRepository
      .createQueryBuilder('resume')
      .leftJoinAndSelect('resume.application', 'application')
      .leftJoinAndSelect('resume.professionalExperiences', 'professionalExperiences')
      .leftJoinAndSelect('resume.academicFormations', 'academicFormations')
      .leftJoinAndSelect('resume.achievements', 'achievements')
      .leftJoinAndSelect('resume.languages', 'languages')
      .where('application.jobId = :jobId', { jobId })
      .getMany();
  }

  async findByCompanyId(companyId: string): Promise<Resume[]> {
    return this.resumeRepository
      .createQueryBuilder('resume')
      .leftJoinAndSelect('resume.application', 'application')
      .leftJoinAndSelect('resume.professionalExperiences', 'professionalExperiences')
      .leftJoinAndSelect('resume.academicFormations', 'academicFormations')
      .leftJoinAndSelect('resume.achievements', 'achievements')
      .leftJoinAndSelect('resume.languages', 'languages')
      .where('application.companyId = :companyId', { companyId })
      .getMany();
  }
} 