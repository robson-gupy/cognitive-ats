import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { Job } from './entities/job.entity';
import { Resume } from './entities/resume.entity';
import { ApplicationQuestionResponse } from './entities/application-question-response.entity';
import { AiServiceClient, CandidateEvaluationRequest } from './ai-service.client';
import { UpdateApplicationEvaluationDto } from './dto/update-application-evaluation.dto';

@Injectable()
export class CandidateEvaluationService {
  private readonly logger = new Logger(CandidateEvaluationService.name);

  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(Resume)
    private resumesRepository: Repository<Resume>,
    @InjectRepository(ApplicationQuestionResponse)
    private questionResponsesRepository: Repository<ApplicationQuestionResponse>,
    private aiServiceClient: AiServiceClient,
  ) {}

  async evaluateApplication(applicationId: string): Promise<Application> {
    this.logger.log(`Iniciando avaliação da application ${applicationId}`);

    try {
      // Buscar a application com todas as relações necessárias
      const application = await this.applicationsRepository.findOne({
        where: { id: applicationId },
        relations: [
          'job',
          'resume',
          'resume.professionalExperiences',
          'resume.academicFormations',
          'resume.achievements',
          'resume.languages',
          'questionResponses',
          'questionResponses.jobQuestion',
        ],
      });

      if (!application) {
        throw new Error(`Application ${applicationId} não encontrada`);
      }

      if (!application.resume) {
        this.logger.warn(`Application ${applicationId} não possui resume para avaliação`);
        return application;
      }

      // Preparar dados do resume
      const resumeData = this.prepareResumeData(application);

      // Preparar dados da vaga
      const jobData = this.prepareJobData(application.job);

      // Preparar respostas das perguntas
      const questionResponses = this.prepareQuestionResponses(application.questionResponses);

      // Criar request para o AI Service
      const evaluationRequest: CandidateEvaluationRequest = {
        resume: resumeData,
        job: jobData,
        question_responses: questionResponses,
      };

      // Chamar o AI Service
      this.logger.log(`Chamando AI Service para avaliação da application ${applicationId}`);
      const evaluationResult = await this.aiServiceClient.evaluateCandidate(evaluationRequest);

      // Preparar dados para atualização
      const updateData: UpdateApplicationEvaluationDto = {
        overallScore: evaluationResult.overall_score,
        questionResponsesScore: evaluationResult.question_responses_score,
        educationScore: evaluationResult.education_score,
        experienceScore: evaluationResult.experience_score,
        evaluationProvider: evaluationResult.provider,
        evaluationModel: evaluationResult.model,
        evaluationDetails: evaluationResult.evaluation_details,
        evaluatedAt: new Date().toISOString(),
      };

      // Atualizar a application com os scores
      Object.assign(application, updateData);
      const updatedApplication = await this.applicationsRepository.save(application);

      this.logger.log(`Avaliação concluída para application ${applicationId}. Score geral: ${evaluationResult.overall_score}`);

      return updatedApplication;
    } catch (error) {
      this.logger.error(`Erro ao avaliar application ${applicationId}:`, error);
      throw error;
    }
  }

  private prepareResumeData(application: Application) {
    const resume = application.resume;
    if (!resume) return {};

    return {
      personal_info: {
        name: `${application.firstName} ${application.lastName}`,
        email: application.email,
        phone: application.phone,
      },
      education: resume.academicFormations?.map(formation => ({
        degree: formation.degree,
        institution: formation.institution,
        year: formation.startDate ? new Date(formation.startDate).getFullYear().toString() : '',
        gpa: formation.description || '',
      })) || [],
      experience: resume.professionalExperiences?.map(exp => ({
        title: exp.position,
        company: exp.companyName,
        duration: `${exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''} - ${exp.isCurrent ? 'Atual' : exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}`,
        description: exp.description || '',
      })) || [],
      skills: resume.summary ? this.extractSkillsFromSummary(resume.summary) : [],
      languages: resume.languages?.map(lang => ({
        language: lang.language,
        level: lang.proficiencyLevel,
      })) || [],
      achievements: resume.achievements?.map(achievement => achievement.description) || [],
    };
  }

  private prepareJobData(job: Job) {
    return {
      title: job.title,
      description: job.description,
      requirements: job.requirements ? this.parseRequirements(job.requirements) : [],
      education_required: this.extractEducationRequirement(job.requirements),
      experience_required: this.extractExperienceRequirement(job.requirements),
      skills_required: this.extractSkillsFromRequirements(job.requirements),
    };
  }

  private prepareQuestionResponses(questionResponses: ApplicationQuestionResponse[]) {
    if (!questionResponses || questionResponses.length === 0) {
      return undefined;
    }

    return questionResponses.map(response => ({
      question: response.jobQuestion.question,
      answer: response.answer,
    }));
  }

  private extractSkillsFromSummary(summary: string): string[] {
    // Implementação básica para extrair habilidades do resumo
    // Em um cenário real, isso poderia usar NLP ou IA
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#',
      'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
      'Git', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Kanban'
    ];

    const foundSkills = commonSkills.filter(skill => 
      summary.toLowerCase().includes(skill.toLowerCase())
    );

    return foundSkills;
  }

  private parseRequirements(requirements: string): string[] {
    // Dividir requirements por linhas e filtrar linhas vazias
    return requirements
      .split('\n')
      .map(req => req.trim())
      .filter(req => req.length > 0);
  }

  private extractEducationRequirement(requirements: string): string {
    const educationKeywords = ['graduação', 'bacharelado', 'técnico', 'mestrado', 'doutorado', 'superior'];
    const lines = requirements.toLowerCase().split('\n');
    
    for (const line of lines) {
      for (const keyword of educationKeywords) {
        if (line.includes(keyword)) {
          return line.trim();
        }
      }
    }
    
    return 'Formação acadêmica adequada';
  }

  private extractExperienceRequirement(requirements: string): string {
    const experienceKeywords = ['anos', 'experiência', 'senior', 'pleno', 'junior'];
    const lines = requirements.toLowerCase().split('\n');
    
    for (const line of lines) {
      for (const keyword of experienceKeywords) {
        if (line.includes(keyword)) {
          return line.trim();
        }
      }
    }
    
    return 'Experiência profissional adequada';
  }

  private extractSkillsFromRequirements(requirements: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#',
      'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
      'Git', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Kanban'
    ];

    const foundSkills = commonSkills.filter(skill => 
      requirements.toLowerCase().includes(skill.toLowerCase())
    );

    return foundSkills;
  }
}
