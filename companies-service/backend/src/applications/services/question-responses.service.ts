import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ApplicationQuestionResponse } from '../entities/application-question-response.entity';
import { JobQuestion } from '../../jobs/entities/job-question.entity';
import { Application } from '../entities/application.entity';
import { CreateQuestionResponseDto } from '../dto/create-question-response.dto';
import { CreateMultipleQuestionResponsesDto } from '../dto/create-multiple-question-responses.dto';
import { UpdateQuestionResponseDto } from '../dto/update-question-response.dto';
import { SqsClientService } from '../../shared/services/sqs-client.service';

@Injectable()
export class QuestionResponsesService {
  constructor(
    @InjectRepository(ApplicationQuestionResponse)
    private questionResponseRepository: Repository<ApplicationQuestionResponse>,
    @InjectRepository(JobQuestion)
    private jobQuestionRepository: Repository<JobQuestion>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private sqsClientService: SqsClientService,
  ) {}

  async create(
    applicationId: string,
    createQuestionResponseDto: CreateQuestionResponseDto,
  ): Promise<ApplicationQuestionResponse> {
    // Buscar a aplicação para obter jobId e companyId
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job', 'company'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Buscar a pergunta do job para validar se pertence ao job correto
    const jobQuestion = await this.jobQuestionRepository.findOne({
      where: { id: createQuestionResponseDto.jobQuestionId },
    });

    if (!jobQuestion) {
      throw new NotFoundException('Job question not found');
    }

    // Validar se a pergunta pertence ao job da aplicação
    if (jobQuestion.jobId !== application.jobId) {
      throw new BadRequestException(
        'Job question does not belong to the job of this application',
      );
    }

    // Verificar se já existe uma resposta para esta pergunta nesta aplicação
    const existingResponse = await this.questionResponseRepository.findOne({
      where: {
        applicationId,
        jobQuestionId: createQuestionResponseDto.jobQuestionId,
      },
    });

    if (existingResponse) {
      throw new BadRequestException(
        'Response already exists for this question in this application',
      );
    }

    // Criar a resposta
    const questionResponse = this.questionResponseRepository.create({
      applicationId,
      jobId: application.jobId,
      companyId: application.companyId,
      jobQuestionId: createQuestionResponseDto.jobQuestionId,
      question: jobQuestion.question,
      answer: createQuestionResponseDto.answer,
    });

    const savedResponse = await this.questionResponseRepository.save(questionResponse);

    // Emitir evento para a fila SQS
    try {
      await this.emitQuestionResponseEvent(savedResponse, application);
    } catch (error) {
      // Log do erro mas não falhar a operação principal
      console.error('Erro ao emitir evento SQS para resposta da pergunta:', error);
    }

    return savedResponse;
  }

  async createMultiple(
    applicationId: string,
    createMultipleQuestionResponsesDto: CreateMultipleQuestionResponsesDto,
  ): Promise<ApplicationQuestionResponse[]> {
    // Buscar a aplicação para obter jobId e companyId
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job', 'company'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Buscar todas as perguntas do job de uma vez
    const jobQuestionIds = createMultipleQuestionResponsesDto.responses.map(
      (response) => response.jobQuestionId,
    );

    const jobQuestions = await this.jobQuestionRepository.find({
      where: { id: In(jobQuestionIds) },
    });

    // Criar um mapa para facilitar a busca
    const jobQuestionsMap = new Map(
      jobQuestions.map((question) => [question.id, question]),
    );

    // Verificar se todas as perguntas existem
    const missingQuestions = jobQuestionIds.filter(
      (id) => !jobQuestionsMap.has(id),
    );

    if (missingQuestions.length > 0) {
      throw new NotFoundException(
        `Job questions not found: ${missingQuestions.join(', ')}`,
      );
    }

    // Verificar se todas as perguntas pertencem ao job da aplicação
    const invalidQuestions = jobQuestions.filter(
      (question) => question.jobId !== application.jobId,
    );

    if (invalidQuestions.length > 0) {
      throw new BadRequestException(
        `Job questions do not belong to the job of this application: ${invalidQuestions
          .map((q) => q.id)
          .join(', ')}`,
      );
    }

    // Verificar respostas duplicadas na requisição
    const questionIdsInRequest =
      createMultipleQuestionResponsesDto.responses.map(
        (response) => response.jobQuestionId,
      );
    const uniqueQuestionIds = new Set(questionIdsInRequest);

    if (uniqueQuestionIds.size !== questionIdsInRequest.length) {
      throw new BadRequestException('Duplicate job question IDs in request');
    }

    // Verificar se já existem respostas para estas perguntas nesta aplicação
    const existingResponses = await this.questionResponseRepository.find({
      where: {
        applicationId,
        jobQuestionId: In(jobQuestionIds),
      },
    });

    if (existingResponses.length > 0) {
      const existingQuestionIds = existingResponses.map((r) => r.jobQuestionId);
      throw new BadRequestException(
        `Responses already exist for these questions: ${existingQuestionIds.join(', ')}`,
      );
    }

    // Criar todas as respostas
    const questionResponses = createMultipleQuestionResponsesDto.responses.map(
      (responseDto) => {
        const jobQuestion = jobQuestionsMap.get(responseDto.jobQuestionId);
        if (!jobQuestion) {
          throw new NotFoundException(
            `Job question not found: ${responseDto.jobQuestionId}`,
          );
        }
        return this.questionResponseRepository.create({
          applicationId,
          jobId: application.jobId,
          companyId: application.companyId,
          jobQuestionId: responseDto.jobQuestionId,
          question: jobQuestion.question,
          answer: responseDto.answer,
        });
      },
    );

    const savedResponses = await this.questionResponseRepository.save(questionResponses);

    // Emitir evento para a fila SQS com todas as respostas
    try {
      await this.emitMultipleQuestionResponsesEvent(savedResponses, application);
    } catch (error) {
      // Log do erro mas não falhar a operação principal
      console.error('Erro ao emitir evento SQS para múltiplas respostas de perguntas:', error);
    }

    return savedResponses;
  }

  async findAllByApplication(
    applicationId: string,
  ): Promise<ApplicationQuestionResponse[]> {
    return this.questionResponseRepository.find({
      where: { applicationId },
      relations: ['jobQuestion'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ApplicationQuestionResponse> {
    const questionResponse = await this.questionResponseRepository.findOne({
      where: { id },
      relations: ['jobQuestion', 'application'],
    });

    if (!questionResponse) {
      throw new NotFoundException('Question response not found');
    }

    return questionResponse;
  }

  async update(
    id: string,
    updateQuestionResponseDto: UpdateQuestionResponseDto,
  ): Promise<ApplicationQuestionResponse> {
    const questionResponse = await this.findOne(id);

    Object.assign(questionResponse, updateQuestionResponseDto);

    const updatedResponse = await this.questionResponseRepository.save(questionResponse);

    // Emitir evento para a fila SQS após atualização
    try {
      const application = await this.applicationRepository.findOne({
        where: { id: questionResponse.applicationId },
        relations: ['job', 'company'],
      });
      
      if (application) {
        await this.emitQuestionResponseEvent(updatedResponse, application);
      }
    } catch (error) {
      // Log do erro mas não falhar a operação principal
      console.error('Erro ao emitir evento SQS para atualização de resposta da pergunta:', error);
    }

    return updatedResponse;
  }

  async remove(id: string): Promise<void> {
    const questionResponse = await this.findOne(id);
    await this.questionResponseRepository.remove(questionResponse);
  }

  /**
   * Emite evento para a fila SQS quando uma resposta de pergunta é criada/atualizada
   */
  private async emitQuestionResponseEvent(
    questionResponse: ApplicationQuestionResponse,
    application: Application,
  ): Promise<void> {
    const queueName = process.env.QUESTION_RESPONSES_SQS_QUEUE_NAME || 'question-responses-queue';
    
    const messageBody = {
      eventType: 'QUESTION_RESPONSE_CREATED',
      timestamp: new Date().toISOString(),
      data: {
        questionResponseId: questionResponse.id,
        applicationId: questionResponse.applicationId,
        jobId: questionResponse.jobId,
        companyId: questionResponse.companyId,
        jobQuestionId: questionResponse.jobQuestionId,
        question: questionResponse.question,
        answer: questionResponse.answer,
        createdAt: questionResponse.createdAt,
      },
      job: {
        id: application.job.id,
        title: application.job.title,
        slug: application.job.slug,
        description: application.job.description,
        requirements: application.job.requirements,
      },
      company: {
        id: application.company.id,
        name: application.company.name,
        slug: application.company.slug,
      },
      application: {
        id: application.id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        createdAt: application.createdAt,
      },
    };

    await this.sqsClientService.sendMessage(queueName, messageBody);
  }

  /**
   * Emite evento para a fila SQS quando múltiplas respostas de perguntas são criadas
   */
  private async emitMultipleQuestionResponsesEvent(
    questionResponses: ApplicationQuestionResponse[],
    application: Application,
  ): Promise<void> {
    const queueName = process.env.QUESTION_RESPONSES_SQS_QUEUE_NAME || 'question-responses-queue';
    
    const messageBody = {
      eventType: 'MULTIPLE_QUESTION_RESPONSES_CREATED',
      timestamp: new Date().toISOString(),
      data: {
        totalResponses: questionResponses.length,
        responses: questionResponses.map(response => ({
          questionResponseId: response.id,
          jobQuestionId: response.jobQuestionId,
          question: response.question,
          answer: response.answer,
          createdAt: response.createdAt,
        })),
        applicationId: application.id,
        jobId: application.job.id,
        companyId: application.company.id,
      },
      job: {
        id: application.job.id,
        title: application.job.title,
        slug: application.job.slug,
        description: application.job.description,
        requirements: application.job.requirements,
      },
      company: {
        id: application.company.id,
        name: application.company.name,
        slug: application.company.slug,
      },
      application: {
        id: application.id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        createdAt: application.createdAt,
      },
    };

    await this.sqsClientService.sendMessage(queueName, messageBody);
  }
}
