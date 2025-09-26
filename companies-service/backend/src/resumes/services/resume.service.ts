import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../entities/resume.entity';
import { Application, EvaluationDetails } from '../../applications/entities/application.entity';
import { CreateResumeDto } from '../dto/create-resume.dto';
import { UpdateResumeDto } from '../dto/update-resume.dto';
import { AiServiceClient } from '../../shared/ai/ai-service.client';

import { QuestionResponsesService } from '../../applications/services/question-responses.service';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private aiServiceClient: AiServiceClient,

    private questionResponsesService: QuestionResponsesService,
  ) {}

  async create(
    applicationId: string,
    createResumeDto: CreateResumeDto,
  ): Promise<Resume> {
    // Verificar se a aplicação existe
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job'],
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
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

    // Salvar o currículo no banco de dados
    const savedResume = await this.resumeRepository.save(resume);

    // Após salvar o currículo, avaliar o candidato automaticamente
    try {
      await this.evaluateCandidateAfterResumeCreation(
        applicationId,
        savedResume,
      );
    } catch (error) {
      console.error(
        'Erro ao avaliar candidato após criação do currículo:',
        error,
      );
      // Não falhar a criação do currículo se a avaliação falhar
    }

    return savedResume;
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
      throw new NotFoundException(
        `Resume not found for application ${applicationId}`,
      );
    }

    return resume;
  }

  async update(
    applicationId: string,
    updateResumeDto: UpdateResumeDto,
  ): Promise<Resume> {
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
      .leftJoinAndSelect(
        'resume.professionalExperiences',
        'professionalExperiences',
      )
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
      .leftJoinAndSelect(
        'resume.professionalExperiences',
        'professionalExperiences',
      )
      .leftJoinAndSelect('resume.academicFormations', 'academicFormations')
      .leftJoinAndSelect('resume.achievements', 'achievements')
      .leftJoinAndSelect('resume.languages', 'languages')
      .where('application.companyId = :companyId', { companyId })
      .getMany();
  }

  private async evaluateCandidateAfterResumeCreation(
    applicationId: string,
    resume: Resume,
  ): Promise<void> {
    try {
      // Buscar a aplicação com todas as relações necessárias
      const application = await this.applicationRepository.findOne({
        where: { id: applicationId },
        relations: ['job', 'resume', 'questionResponses'],
      });

      if (!application || !application.job) {
        console.error('Aplicação ou vaga não encontrada para avaliação');
        return;
      }

      // Buscar o currículo completo com todas as relações
      const completeResume = await this.resumeRepository.findOne({
        where: { applicationId },
        relations: [
          'professionalExperiences',
          'academicFormations',
          'achievements',
          'languages',
        ],
      });

      if (!completeResume) {
        console.error('Currículo completo não encontrado para avaliação');
        return;
      }

      // Buscar respostas das perguntas da aplicação
      const questionResponses =
        await this.questionResponsesService.findAllByApplication(applicationId);

      // Preparar dados do currículo para o AI Service
      const resumeData = {
        personal_info: {
          name: `${application.firstName} ${application.lastName}`,
          email: application.email,
          phone: application.phone,
        },
        education:
          completeResume.academicFormations?.map((formation) => ({
            degree: formation.degree,
            institution: formation.institution,
            year: formation.startDate
              ? new Date(formation.startDate).getFullYear().toString()
              : '',
            gpa: formation.description || '',
          })) || [],
        experience:
          completeResume.professionalExperiences?.map((exp) => ({
            title: exp.position,
            company: exp.companyName,
            duration: `${exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''} - ${exp.isCurrent ? 'Atual' : exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}`,
            description: exp.description || '',
          })) || [],
        skills: [], // Campo não existe na entidade Resume
        languages:
          completeResume.languages?.map((lang) => ({
            language: lang.language,
            level: lang.proficiencyLevel,
          })) || [],
        achievements:
          completeResume.achievements?.map(
            (achievement) => achievement.description,
          ) || [],
      };

      // Preparar dados da vaga para o AI Service
      const jobData = {
        title: application.job.title,
        description: application.job.description,
        requirements: application.job.requirements
          .split('\n')
          .filter((req) => req.trim()),
        responsibilities: [], // Campo não existe na entidade Job
        education_required: '', // Campo não existe na entidade Job
        experience_required: '', // Campo não existe na entidade Job
        skills_required: [], // Campo não existe na entidade Job
      };

      // Preparar respostas das perguntas
      const questionResponsesData = questionResponses.map((qr) => ({
        question: qr.question,
        answer: qr.answer,
      }));

      // Chamar o AI Service para avaliação
      const evaluationResult = await this.aiServiceClient.evaluateCandidate({
        resume: resumeData,
        job: jobData,
        question_responses: questionResponsesData,
      });

      // Atualizar a aplicação com os scores
      const updateData = {
        overallScore: Number(evaluationResult.overall_score),
        questionResponsesScore: Number(
          evaluationResult.question_responses_score,
        ),
        educationScore: Number(evaluationResult.education_score),
        experienceScore: Number(evaluationResult.experience_score),
        evaluationProvider: evaluationResult.provider,
        evaluationModel: evaluationResult.model,
        evaluationDetails:
          evaluationResult.evaluation_details as EvaluationDetails,
        evaluatedAt: new Date(),
      } as any;

      console.log(
        `🔄 Atualizando aplicação ${applicationId} com scores:`,
        updateData,
      );

      const updateResult = await this.applicationRepository.update(
        applicationId,
        updateData,
      );

      console.log(`📝 Resultado da atualização:`, updateResult);

      // Verificar se a atualização foi bem-sucedida
      const updatedApplication = await this.applicationRepository.findOne({
        where: { id: applicationId },
        select: [
          'id',
          'overallScore',
          'questionResponsesScore',
          'educationScore',
          'experienceScore',
          'evaluationProvider',
          'evaluationModel',
          'evaluatedAt',
        ],
      });

      console.log(`🔍 Aplicação após atualização:`, updatedApplication);

      console.log(
        `✅ Candidato avaliado com sucesso para aplicação ${applicationId}`,
      );
      console.log(
        `📊 Scores: Geral=${evaluationResult.overall_score}, Respostas=${evaluationResult.question_responses_score}, Educação=${evaluationResult.education_score}, Experiência=${evaluationResult.experience_score}`,
      );
    } catch (error) {
      console.error('❌ Erro ao avaliar candidato:', error);
      throw error;
    }
  }
}
