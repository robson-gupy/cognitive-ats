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

@Injectable()
export class QuestionResponsesService {
  constructor(
    @InjectRepository(ApplicationQuestionResponse)
    private questionResponseRepository: Repository<ApplicationQuestionResponse>,
    @InjectRepository(JobQuestion)
    private jobQuestionRepository: Repository<JobQuestion>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(
    applicationId: string,
    createQuestionResponseDto: CreateQuestionResponseDto,
  ): Promise<ApplicationQuestionResponse> {
    // Buscar a aplicação para obter jobId e companyId
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
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

    return this.questionResponseRepository.save(questionResponse);
  }

  async createMultiple(
    applicationId: string,
    createMultipleQuestionResponsesDto: CreateMultipleQuestionResponsesDto,
  ): Promise<ApplicationQuestionResponse[]> {
    // Buscar a aplicação para obter jobId e companyId
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
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

    return this.questionResponseRepository.save(questionResponses);
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

    return this.questionResponseRepository.save(questionResponse);
  }

  async remove(id: string): Promise<void> {
    const questionResponse = await this.findOne(id);
    await this.questionResponseRepository.remove(questionResponse);
  }
}
