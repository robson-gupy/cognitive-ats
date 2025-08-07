import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';
import { JobQuestion } from './entities/job-question.entity';
import { JobStage } from './entities/job-stage.entity';
import { JobLog } from './entities/job-log.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateJobWithAiDto } from './dto/create-job-with-ai.dto';
import { User } from '../users/entities/user.entity';
import { AiServiceClient, JobCreationRequest } from './ai-service.client';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(JobQuestion)
    private jobQuestionsRepository: Repository<JobQuestion>,
    @InjectRepository(JobStage)
    private jobStagesRepository: Repository<JobStage>,
    @InjectRepository(JobLog)
    private jobLogsRepository: Repository<JobLog>,
    private aiServiceClient: AiServiceClient,
  ) {}

  async create(createJobDto: CreateJobDto, user: User): Promise<Job> {
    console.log('Creating job with user:', {
      userId: user.id,
      companyId: user.companyId,
    });

    if (!user.id) {
      throw new Error('User ID is required');
    }

    const expirationDateValue = createJobDto.expirationDate
      ? `'${createJobDto.expirationDate}'`
      : 'NULL';
    const departmentIdValue = createJobDto.departmentId
      ? `'${createJobDto.departmentId}'`
      : 'NULL';

    const result: Job[] = await this.jobsRepository.query(
      `
        INSERT INTO jobs (id, title, description, requirements, expiration_date, status, company_id, department_id,
                          created_by, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, ${expirationDateValue}, $4, $5, ${departmentIdValue}, $6, NOW(),
                NOW()) RETURNING id, status, created_at, updated_at
      `,
      [
        createJobDto.title,
        createJobDto.description,
        createJobDto.requirements,
        createJobDto.status || JobStatus.DRAFT,
        user.companyId,
        user.id,
      ],
    );

    const jobId = result[0]?.id;
    console.log('Job created with ID:', jobId);

    // Criar perguntas se fornecidas
    if (createJobDto.questions && createJobDto.questions.length > 0) {
      const questions = createJobDto.questions.map((q, index) =>
        this.jobQuestionsRepository.create({
          ...q,
          jobId: jobId,
          orderIndex: q.orderIndex ?? index,
        }),
      );
      await this.jobQuestionsRepository.save(questions);
    }

    // Criar etapas padrão se nenhuma for fornecida
    if (!createJobDto.stages || createJobDto.stages.length === 0) {
      const defaultStages = [
        {
          name: 'Triagem',
          description: 'Avaliação inicial dos candidatos',
          isActive: true,
          orderIndex: 0,
        },
        {
          name: 'Entrevista',
          description: 'Entrevista com candidatos selecionados',
          isActive: true,
          orderIndex: 1,
        },
        {
          name: 'Contratação',
          description: 'Processo final de contratação',
          isActive: true,
          orderIndex: 2,
        },
      ];

      const stages = defaultStages.map((s, index) =>
        this.jobStagesRepository.create({
          ...s,
          jobId: jobId,
          orderIndex: s.orderIndex ?? index,
        }),
      );
      await this.jobStagesRepository.save(stages);
    } else {
      // Criar etapas fornecidas
      const stages = createJobDto.stages.map((s, index) =>
        this.jobStagesRepository.create({
          ...s,
          jobId: jobId,
          orderIndex: s.orderIndex ?? index,
        }),
      );
      await this.jobStagesRepository.save(stages);
    }

    // Criar log de criação
    await this.createLog(
      jobId,
      user.id,
      'Vaga criada',
      'status',
      undefined,
      JobStatus.DRAFT,
    );

    return this.findOne(jobId, user.companyId);
  }

  async createWithAi(
    createJobWithAiDto: CreateJobWithAiDto,
    user: User,
  ): Promise<Job> {
    console.log('Creating job with AI:', {
      userId: user.id,
      companyId: user.companyId,
    });

    if (!user.id) {
      throw new Error('User ID is required');
    }

    // Preparar requisição para o AI Service
    const aiRequest: JobCreationRequest = {
      prompt: createJobWithAiDto.prompt,
      generate_questions: true,
      generate_stages: true,
      max_questions: createJobWithAiDto.maxQuestions || 5,
      max_stages: createJobWithAiDto.maxStages || 3,
    };

    // Chamar AI Service
    const aiResponse =
      await this.aiServiceClient.createJobFromPrompt(aiRequest);

    // Criar vaga com dados gerados pela IA
    const createJobDto: CreateJobDto = {
      title: aiResponse.title,
      description: aiResponse.description,
      requirements: aiResponse.requirements,
      status: JobStatus.DRAFT,
      questions: aiResponse.questions?.map((q: any, index) => ({
        question: q.question,
        isRequired: q.isRequired,
        orderIndex: index,
      })),
      stages: aiResponse.stages?.map((s: any, index) => ({
        name: s.name,
        description: s.description,
        isActive: s.isActive,
        orderIndex: index,
      })),
    };

    // Criar a vaga usando o método existente
    return this.create(createJobDto, user);
  }

  async findAll(userCompanyId: string): Promise<Job[]> {
    return await this.jobsRepository.find({
      where: { companyId: userCompanyId },
      relations: ['company', 'department', 'createdBy', 'questions', 'stages'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userCompanyId: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({
      where: {
        id,
        companyId: userCompanyId,
      },
      relations: [
        'company',
        'department',
        'createdBy',
        'questions',
        'stages',
        'logs',
        'logs.user',
      ],
    });

    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    return job;
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    user: User,
  ): Promise<Job> {
    const job = await this.findOne(id, user.companyId);
    const oldValues = { ...job };
    const logsToCreate: Array<{
      description: string;
      fieldName?: string;
      oldValue?: string;
      newValue?: string;
    }> = [];

    // Preparar alterações e logs
    if (updateJobDto.title && updateJobDto.title !== job.title) {
      job.title = updateJobDto.title;
      logsToCreate.push({
        description: `Título alterado de "${oldValues.title}" para "${updateJobDto.title}"`,
        fieldName: 'title',
        oldValue: oldValues.title,
        newValue: updateJobDto.title,
      });
    }

    if (
      updateJobDto.description &&
      updateJobDto.description !== job.description
    ) {
      job.description = updateJobDto.description;
      logsToCreate.push({
        description: 'Descrição da vaga atualizada',
        fieldName: 'description',
        oldValue: oldValues.description,
        newValue: updateJobDto.description,
      });
    }

    if (
      updateJobDto.requirements &&
      updateJobDto.requirements !== job.requirements
    ) {
      job.requirements = updateJobDto.requirements;
      logsToCreate.push({
        description: 'Requisitos da vaga atualizados',
        fieldName: 'requirements',
        oldValue: oldValues.requirements,
        newValue: updateJobDto.requirements,
      });
    }

    if (
      updateJobDto.departmentId !== undefined &&
      updateJobDto.departmentId !== job.departmentId
    ) {
      const oldDepartmentId = job.departmentId;
      job.departmentId = updateJobDto.departmentId;
      logsToCreate.push({
        description: 'Departamento alterado',
        fieldName: 'departmentId',
        oldValue: oldDepartmentId,
        newValue: updateJobDto.departmentId,
      });
    }

    if (updateJobDto.expirationDate) {
      const newExpirationDate = new Date(updateJobDto.expirationDate);
      if (newExpirationDate.getTime() !== job.expirationDate.getTime()) {
        job.expirationDate = newExpirationDate;
        logsToCreate.push({
          description: 'Data de expiração alterada',
          fieldName: 'expirationDate',
          oldValue: oldValues.expirationDate.toISOString(),
          newValue: updateJobDto.expirationDate,
        });
      }
    }

    // Atualizar status
    if (updateJobDto.status && updateJobDto.status !== job.status) {
      const oldStatus = job.status;
      job.status = updateJobDto.status;

      // Definir datas específicas baseadas no status
      if (updateJobDto.status === JobStatus.PUBLISHED && !job.publishedAt) {
        job.publishedAt = new Date();
      } else if (updateJobDto.status === JobStatus.CLOSED && !job.closedAt) {
        job.closedAt = new Date();
      }

      logsToCreate.push({
        description: `Status alterado de "${oldStatus}" para "${updateJobDto.status}"`,
        fieldName: 'status',
        oldValue: oldStatus,
        newValue: updateJobDto.status,
      });
    }

    // Usar transação para garantir consistência
    return await this.jobsRepository.manager.transaction(
      async (entityManager) => {
        // Salvar alterações básicas primeiro
        await entityManager.save(Job, job);

        // Criar logs após o save para evitar problemas de cascade
        for (const logData of logsToCreate) {
          await entityManager.query(
            `INSERT INTO job_logs (job_id, user_id, description, field_name, old_value, new_value, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
              job.id,
              user.id,
              logData.description,
              logData.fieldName || null,
              logData.oldValue || null,
              logData.newValue || null,
            ],
          );
        }

        // Atualizar perguntas e etapas separadamente para evitar conflitos de cascade
        if (updateJobDto.questions) {
          await this.updateQuestions(job.id, updateJobDto.questions, user.id);
        }

        if (updateJobDto.stages) {
          await this.updateStages(job.id, updateJobDto.stages, user.id);
        }

        return this.findOne(id, user.companyId);
      },
    );
  }

  async updateQuestions(
    jobId: string,
    questions: any[],
    userId: string,
  ): Promise<void> {
    // Remover perguntas existentes usando query direta para evitar problemas de cascade
    await this.jobQuestionsRepository.query(
      'DELETE FROM job_questions WHERE job_id = $1',
      [jobId],
    );

    // Criar novas perguntas
    if (questions.length > 0) {
      const newQuestions = questions.map((q: any, index) =>
        this.jobQuestionsRepository.create({
          question: q.question,
          orderIndex: q.orderIndex ?? index,
          isRequired: q.isRequired ?? true,
          jobId,
        }),
      );
      await this.jobQuestionsRepository.save(newQuestions);
    }

    await this.createLog(
      jobId,
      userId,
      'Perguntas do processo seletivo atualizadas',
      'questions',
    );
  }

  async updateStages(
    jobId: string,
    stages: any[],
    userId: string,
  ): Promise<void> {
    // Remover etapas existentes usando query direta para evitar problemas de cascade
    await this.jobStagesRepository.query(
      'DELETE FROM job_stages WHERE job_id = $1',
      [jobId],
    );

    // Criar novas etapas
    if (stages.length > 0) {
      const newStages = stages.map((s: any, index) =>
        this.jobStagesRepository.create({
          name: s.name,
          description: s.description,
          orderIndex: s.orderIndex ?? index,
          isActive: s.isActive ?? true,
          jobId,
        }),
      );
      await this.jobStagesRepository.save(newStages);
    }

    await this.createLog(
      jobId,
      userId,
      'Etapas do processo seletivo atualizadas',
      'stages',
    );
  }

  async remove(id: string, userCompanyId: string): Promise<void> {
    const job = await this.findOne(id, userCompanyId);

    // O TypeORM irá automaticamente remover todos os registros relacionados
    // (questions, stages, logs) devido às foreign keys com ON DELETE CASCADE
    await this.jobsRepository.remove(job);
  }

  async createLog(
    jobId: string,
    userId: string,
    description: string,
    fieldName?: string,
    oldValue?: string,
    newValue?: string,
  ): Promise<void> {
    await this.jobLogsRepository.query(
      `INSERT INTO job_logs (job_id, user_id, description, field_name, old_value, new_value, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        jobId,
        userId,
        description,
        fieldName || null,
        oldValue || null,
        newValue || null,
      ],
    );
  }

  async getLogs(jobId: string, userCompanyId: string): Promise<JobLog[]> {
    await this.findOne(jobId, userCompanyId); // Verificar permissões
    return await this.jobLogsRepository.find({
      where: { jobId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async publish(id: string, user: User): Promise<Job> {
    const job = await this.findOne(id, user.companyId);

    if (job.status !== JobStatus.DRAFT) {
      throw new BadRequestException(
        'Apenas vagas em rascunho podem ser publicadas',
      );
    }

    job.status = JobStatus.PUBLISHED;
    job.publishedAt = new Date();

    await this.jobsRepository.save(job);
    await this.createLog(
      job.id,
      user.id,
      'Vaga publicada',
      'status',
      JobStatus.DRAFT,
      JobStatus.PUBLISHED,
    );

    return this.findOne(id, user.companyId);
  }

  async close(id: string, user: User): Promise<Job> {
    const job = await this.findOne(id, user.companyId);

    if (job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException(
        'Apenas vagas publicadas podem ser fechadas',
      );
    }

    job.status = JobStatus.CLOSED;
    job.closedAt = new Date();

    await this.jobsRepository.save(job);
    await this.createLog(
      job.id,
      user.id,
      'Vaga fechada',
      'status',
      JobStatus.PUBLISHED,
      JobStatus.CLOSED,
    );

    return this.findOne(id, user.companyId);
  }

  async findPublishedJobsByCompany(companyId: string): Promise<any[]> {
    const jobs = await this.jobsRepository.query(`
      SELECT 
        j.id,
        j.title,
        j.description,
        j.requirements,
        j.expiration_date as "expirationDate",
        j.status,
        j.department_id as "departmentId",
        j.created_at as "createdAt",
        j.updated_at as "updatedAt",
        d.name as "departmentName",
        d.description as "departmentDescription"
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      WHERE j.company_id = $1 AND j.status = $2
      ORDER BY j.published_at DESC
    `, [companyId, JobStatus.PUBLISHED]);

    return jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      expirationDate: job.expirationDate,
      status: job.status,
      departmentId: job.departmentId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      department: job.departmentId ? {
        id: job.departmentId,
        name: job.departmentName,
        description: job.departmentDescription
      } : null
    }));
  }
}
