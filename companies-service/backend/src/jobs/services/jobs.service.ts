import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../entities/job.entity';
import { JobQuestion } from '../entities/job-question.entity';
import { JobStage } from '../entities/job-stage.entity';
import { JobLog } from '../entities/job-log.entity';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { CreateJobWithAiDto } from '../dto/create-job-with-ai.dto';
import { User } from '../../users/entities/user.entity';
import { AiServiceClient, JobCreationRequest, } from '../../shared/ai/ai-service.client';
import { generateUniqueSlug } from '../../shared/utils/slug.util';

// Interface para o resultado da query SQL
interface JobQueryResult {
  id: string;
  title: string;
  description: string;
  requirements: string;
  expirationDate: Date | null;
  status: string;
  departmentId: string | null;
  slug: string;
  publishedAt: Date | null;
  departmentName: string | null;
  departmentDescription: string | null;
}

// Interface para o job retornado pela função
export interface PublishedJob {
  id: string;
  title: string;
  description: string;
  requirements: string;
  expirationDate: Date | null;
  status: string;
  departmentId: string | null;
  slug: string;
  publishedAt: Date | null;
  department: {
    id: string;
    name: string;
    description: string;
  } | null;
}

// Interface para o job público retornado pela função
export interface PublicJob extends PublishedJob {
  // Herda de PublishedJob, mas pode ter campos adicionais se necessário
}

// Interfaces para os dados de AI
interface AiQuestion {
  question: string;
  isRequired: boolean;
}

interface AiStage {
  name: string;
  description?: string;
  isActive: boolean;
}

// Interfaces para dados de entrada das funções de update
interface UpdateQuestionData {
  question: string;
  orderIndex?: number;
  isRequired?: boolean;
}

interface UpdateStageData {
  id?: string;
  name: string;
  description?: string;
  orderIndex?: number;
  isActive?: boolean;
  jobId?: string;
}

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

    // Se não foi fornecido um slug, gerar um baseado no título
    if (!createJobDto.slug) {
      const allSlugs = await this.jobsRepository.find({ select: ['slug'] });
      const existingSlugs = allSlugs.map((j) => j.slug);
      createJobDto.slug = generateUniqueSlug(
        user.company.slug,
        createJobDto.title,
        existingSlugs,
      );
    }

    // Verificar se o slug já existe
    const existingSlug = await this.jobsRepository.findOne({
      where: { slug: createJobDto.slug },
    });

    if (existingSlug) {
      throw new BadRequestException('Identificador legível já está em uso');
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
                            created_by, slug, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, ${expirationDateValue}, $4, $5, ${departmentIdValue}, $6, $7, NOW(),
                  NOW()) RETURNING id, status, created_at, updated_at
      `,
      [
        createJobDto.title,
        createJobDto.description,
        createJobDto.requirements,
        createJobDto.status || JobStatus.DRAFT,
        user.companyId,
        user.id,
        createJobDto.slug,
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
      generate_questions: (createJobWithAiDto.maxQuestions || 5) > 0,
      generate_stages: (createJobWithAiDto.maxQuestions || 3) > 0,
      max_questions: createJobWithAiDto.maxQuestions || 5,
      max_stages: createJobWithAiDto.maxStages || 3,
    };

    console.log('AI Request:', JSON.stringify(aiRequest, null, 2));

    // Chamar AI Service
    const aiResponse =
      await this.aiServiceClient.createJobFromPrompt(aiRequest);

    console.log('AI Response:', JSON.stringify(aiResponse, null, 2));

    // Criar vaga com dados gerados pela IA
    const createJobDto: CreateJobDto = {
      title: aiResponse.title,
      description: aiResponse.description,
      requirements: aiResponse.requirements,
      status: JobStatus.DRAFT,
      questions: aiResponse.questions?.map((q: AiQuestion, index) => ({
        question: q.question,
        isRequired: q.isRequired,
        orderIndex: index,
      })),
      stages: aiResponse.stages?.map((s: AiStage, index) => ({
        name: s.name,
        description: s.description,
        isActive: s.isActive,
        orderIndex: index,
      })),
    };

    console.log('CreateJobDto:', JSON.stringify(createJobDto, null, 2));

    // Criar a vaga usando o método existente
    return this.create(createJobDto, user);
  }

  async findAll(userCompanyId: string): Promise<Job[]> {
    // Primeiro, buscar todos os jobs
    const jobs = await this.jobsRepository.find({
      where: { companyId: userCompanyId },
      relations: ['company', 'department', 'createdBy', 'questions', 'stages'],
      order: {
        createdAt: 'DESC',
        questions: { orderIndex: 'ASC' },
        stages: { orderIndex: 'ASC' },
      },
    });

    console.log(`Found ${jobs.length} jobs for company ${userCompanyId}`);

    // Verificar se existem applications na tabela
    const totalApplications = await this.jobsRepository.query(`
        SELECT COUNT(*) as total
        FROM applications
    `);
    console.log('Total applications in database:', totalApplications[0].total);

    // Buscar contagem de applications para cada job usando query SQL direta
    const applicationCounts = await this.jobsRepository.query(
      `
          SELECT j.id as "jobId",
                 COALESCE(COUNT(a.id), 0) as count
          FROM jobs j
              LEFT JOIN applications a
          ON j.id = a.job_id
          WHERE j.company_id = $1
          GROUP BY j.id
      `,
      [userCompanyId],
    );

    console.log('Application counts:', applicationCounts);

    // Criar um mapa de jobId -> count
    const countMap = new Map();
    applicationCounts.forEach((item) => {
      const count = parseInt(item.count);
      console.log(`Mapping jobId: ${item.jobId}, count: ${count}`);
      countMap.set(item.jobId, count);
    });

    console.log('Count map:', countMap);

    // Adicionar applicationCount a cada job
    const jobsWithCounts = jobs.map((job) => {
      const count = countMap.get(job.id) || 0;
      console.log(`Job ${job.id} (${job.title}): ${count} applications`);
      return {
        ...job,
        applicationCount: count,
      };
    });

    return jobsWithCounts;
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
      order: {
        questions: { orderIndex: 'ASC' },
        stages: { orderIndex: 'ASC' },
      },
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

    if (updateJobDto.slug && updateJobDto.slug !== job.slug) {
      // Verificar se o slug já existe
      const existingSlug = await this.jobsRepository.findOne({
        where: { slug: updateJobDto.slug },
      });

      if (existingSlug) {
        throw new BadRequestException('Identificador legível já está em uso');
      }

      job.slug = updateJobDto.slug;
      logsToCreate.push({
        description: `Identificador legível alterado de "${oldValues.slug}" para "${updateJobDto.slug}"`,
        fieldName: 'slug',
        oldValue: oldValues.slug,
        newValue: updateJobDto.slug,
      });
    }

    // Se o slug não foi fornecido mas o título foi alterado, gerar um novo slug
    if (
      !updateJobDto.slug &&
      updateJobDto.title &&
      updateJobDto.title !== job.title
    ) {
      const allSlugs = await this.jobsRepository.find({ select: ['slug'] });
      const existingSlugs = allSlugs.map((j) => j.slug);
      const newSlug = generateUniqueSlug('', updateJobDto.title, existingSlugs);

      job.slug = newSlug;
      logsToCreate.push({
        description: `Identificador legível alterado de "${oldValues.slug}" para "${newSlug}"`,
        fieldName: 'slug',
        oldValue: oldValues.slug,
        newValue: newSlug,
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

        // Só atualizar stages se realmente houver mudanças
        if (updateJobDto.stages && updateJobDto.stages.length > 0) {
          const existingStages = await this.jobStagesRepository.find({
            where: { jobId: job.id },
            order: { orderIndex: 'ASC' },
          });

          // Verificar se há mudanças reais nos stages
          const hasStageChanges = this.hasStageChanges(
            existingStages,
            updateJobDto.stages,
          );

          if (hasStageChanges) {
            await this.updateStages(job.id, updateJobDto.stages, user.id);
          }
        }

        return this.findOne(id, user.companyId);
      },
    );
  }

  async updateQuestions(
    jobId: string,
    questions: UpdateQuestionData[],
    userId: string,
  ): Promise<void> {
    // Remover perguntas existentes usando query direta para evitar problemas de cascade
    await this.jobQuestionsRepository.query(
      'DELETE FROM job_questions WHERE job_id = $1',
      [jobId],
    );

    // Criar novas perguntas
    if (questions.length > 0) {
      const newQuestions = questions.map((q: UpdateQuestionData, index) =>
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
    stages: UpdateStageData[],
    userId: string,
  ): Promise<void> {
    // Buscar stages existentes
    const existingStages = await this.jobStagesRepository.find({
      where: { jobId },
      order: { orderIndex: 'ASC' },
    });

    // Se não há stages para atualizar, não fazer nada
    if (!stages || stages.length === 0) {
      return;
    }

    const stagesToUpdate: UpdateStageData[] = [];
    const stagesToCreate: UpdateStageData[] = [];
    const stagesToDelete: string[] = [];

    // Mapear stages existentes por ID
    const existingStagesMap = new Map(
      existingStages.map((stage) => [stage.id, stage]),
    );

    // Processar stages enviados
    stages.forEach((stageData: UpdateStageData, index) => {
      if (stageData.id && existingStagesMap.has(stageData.id)) {
        // Stage existente - atualizar apenas se houver mudanças
        const existingStage = existingStagesMap.get(stageData.id)!;

        // Verificar se há mudanças reais
        const hasChanges =
          existingStage.name !== stageData.name ||
          existingStage.description !== stageData.description ||
          existingStage.orderIndex !== (stageData.orderIndex ?? index) ||
          existingStage.isActive !== (stageData.isActive ?? true);

        if (hasChanges) {
          const updatedStage = {
            ...existingStage,
            name: stageData.name,
            description: stageData.description,
            orderIndex: stageData.orderIndex ?? index,
            isActive: stageData.isActive ?? true,
          };
          stagesToUpdate.push(updatedStage);
        }

        existingStagesMap.delete(stageData.id);
      } else {
        // Novo stage - criar
        stagesToCreate.push({
          name: stageData.name,
          description: stageData.description,
          orderIndex: stageData.orderIndex ?? index,
          isActive: stageData.isActive ?? true,
          jobId: jobId,
        });
      }
    });

    // Stages que não foram enviados devem ser deletados
    stagesToDelete.push(...existingStagesMap.keys());

    // Executar operações em transação
    await this.jobStagesRepository.manager.transaction(
      async (entityManager) => {
        // Verificar se há aplicações usando os stages que serão deletados
        if (stagesToDelete.length > 0) {
          // Verificar se há aplicações nos stages que serão deletados
          const applicationsInStages = await entityManager.query(
            'SELECT COUNT(*) as count FROM applications WHERE current_stage_id = ANY($1)',
            [stagesToDelete],
          );

          if (applicationsInStages[0].count > 0) {
            throw new BadRequestException(
              'Não é possível excluir etapas que possuem candidatos. Mova os candidatos para outras etapas primeiro.',
            );
          }

          // Deletar histórico de movimentação que referencia esses stages
          await entityManager.query(
            'DELETE FROM application_stage_history WHERE from_stage_id = ANY($1) OR to_stage_id = ANY($1)',
            [stagesToDelete],
          );

          // Deletar stages que não estão mais presentes
          await entityManager.query(
            'DELETE FROM job_stages WHERE id = ANY($1)',
            [stagesToDelete],
          );
        }

        // Atualizar stages existentes
        if (stagesToUpdate.length > 0) {
          await entityManager.save(JobStage, stagesToUpdate);
        }

        // Criar novos stages
        if (stagesToCreate.length > 0) {
          const newStages = stagesToCreate.map((stageData) =>
            entityManager.create(JobStage, stageData),
          );
          await entityManager.save(JobStage, newStages);
        }
      },
    );

    // Só criar log se houve mudanças
    if (stagesToUpdate.length > 0 || stagesToCreate.length > 0) {
      await this.createLog(
        jobId,
        userId,
        'Etapas do processo seletivo atualizadas',
        'stages',
      );
    }
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

  async findPublishedJobsByCompany(companyId: string): Promise<PublishedJob[]> {
    const jobs: JobQueryResult[] = await this.jobsRepository.query(
      `
          SELECT j.id,
                 j.title,
                 j.description,
                 j.requirements,
                 j.expiration_date as "expirationDate",
                 j.status,
                 j.department_id   as "departmentId",
                 j.slug,
                 j.published_at    as "publishedAt",
                 d.name            as "departmentName",
                 d.description     as "departmentDescription"
          FROM jobs j
                   LEFT JOIN departments d ON j.department_id = d.id
          WHERE j.company_id = $1
            AND j.status = $2
          ORDER BY j.published_at DESC
      `,
      [companyId, JobStatus.PUBLISHED],
    );

    return jobs.map(
      (job: JobQueryResult): PublishedJob => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        expirationDate: job.expirationDate,
        status: job.status,
        departmentId: job.departmentId,
        slug: job.slug,
        publishedAt: job.publishedAt,
        department: job.departmentId
          ? {
              id: job.departmentId,
              name: job.departmentName || '',
              description: job.departmentDescription || '',
            }
          : null,
      }),
    );
  }

  async findPublicJobById(
    companySlug: string,
    jobId: string,
  ): Promise<PublicJob> {
    const job: JobQueryResult[] = await this.jobsRepository.query(
      `
          SELECT j.id,
                 j.title,
                 j.description,
                 j.requirements,
                 j.expiration_date as "expirationDate",
                 j.status,
                 j.department_id   as "departmentId",
                 j.slug,
                 j.published_at    as "publishedAt",
                 d.name            as "departmentName",
                 d.description     as "departmentDescription"
          FROM jobs j
                   LEFT JOIN departments d ON j.department_id = d.id
                   LEFT JOIN companies c ON j.company_id = c.id
          WHERE c.slug = $1
            AND j.id = $2
            AND j.status = $3
      `,
      [companySlug, jobId, JobStatus.PUBLISHED],
    );

    if (!job || job.length === 0) {
      throw new NotFoundException('Vaga não encontrada ou não está publicada');
    }

    const jobData: JobQueryResult = job[0];
    return {
      id: jobData.id,
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      expirationDate: jobData.expirationDate,
      status: jobData.status,
      departmentId: jobData.departmentId,
      slug: jobData.slug,
      publishedAt: jobData.publishedAt,
      department: jobData.departmentId
        ? {
            id: jobData.departmentId,
            name: jobData.departmentName || '',
            description: jobData.departmentDescription || '',
          }
        : null,
    };
  }

  async findPublicJobBySlug(
    companySlug: string,
    jobSlug: string,
  ): Promise<PublicJob> {
    const job: JobQueryResult[] = await this.jobsRepository.query(
      `
          SELECT j.id,
                 j.title,
                 j.description,
                 j.requirements,
                 j.expiration_date as "expirationDate",
                 j.status,
                 j.department_id   as "departmentId",
                 j.slug,
                 j.published_at    as "publishedAt",
                 d.name            as "departmentName",
                 d.description     as "departmentDescription"
          FROM jobs j
                   LEFT JOIN departments d ON j.department_id = d.id
                   LEFT JOIN companies c ON j.company_id = c.id
          WHERE c.slug = $1
            AND j.slug = $2
            AND j.status = $3
      `,
      [companySlug, jobSlug, JobStatus.PUBLISHED],
    );

    if (!job || job.length === 0) {
      throw new NotFoundException('Vaga não encontrada ou não está publicada');
    }

    const jobData: JobQueryResult = job[0];
    return {
      id: jobData.id,
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      expirationDate: jobData.expirationDate,
      status: jobData.status,
      departmentId: jobData.departmentId,
      slug: jobData.slug,
      publishedAt: jobData.publishedAt,
      department: jobData.departmentId
        ? {
            id: jobData.departmentId,
            name: jobData.departmentName || '',
            description: jobData.departmentDescription || '',
          }
        : null,
    };
  }

  async findPublicJobQuestionsBySlug(
    companySlug: string,
    jobSlug: string,
  ): Promise<
    {
      id: string;
      question: string;
      orderIndex: number;
      isRequired: boolean;
    }[]
  > {
    // Primeiro verificar se a job existe e está publicada
    const job = await this.findPublicJobBySlug(companySlug, jobSlug);

    // Buscar as questions da job
    const questions = await this.jobQuestionsRepository.find({
      where: { jobId: job.id },
      order: { orderIndex: 'ASC' },
      select: ['id', 'question', 'orderIndex', 'isRequired'],
    });

    return questions;
  }

  private hasStageChanges(
    existingStages: JobStage[],
    newStages: UpdateStageData[],
  ): boolean {
    // Se o número de stages mudou, há mudanças
    if (existingStages.length !== newStages.length) {
      return true;
    }

    // Criar map dos stages existentes por ID
    const existingStagesMap = new Map(
      existingStages.map((stage) => [stage.id, stage]),
    );

    // Verificar se cada stage novo corresponde ao existente
    for (const newStage of newStages) {
      if (!newStage.id) {
        // Stage sem ID é considerado novo
        return true;
      }

      const existingStage = existingStagesMap.get(newStage.id);
      if (!existingStage) {
        // Stage com ID não encontrado é considerado novo
        return true;
      }

      // Verificar se os campos principais mudaram
      if (
        existingStage.name !== newStage.name ||
        existingStage.description !== newStage.description ||
        existingStage.orderIndex !==
          (newStage.orderIndex ?? existingStage.orderIndex) ||
        existingStage.isActive !== (newStage.isActive ?? existingStage.isActive)
      ) {
        return true;
      }
    }

    return false;
  }
}
