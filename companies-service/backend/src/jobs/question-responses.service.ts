import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationQuestionResponse } from './entities/application-question-response.entity';
import { JobQuestion } from './entities/job-question.entity';
import { Application } from './entities/application.entity';
import { CreateQuestionResponseDto } from './dto/create-question-response.dto';
import { UpdateQuestionResponseDto } from './dto/update-question-response.dto';

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
      throw new BadRequestException('Job question does not belong to the job of this application');
    }

    // Verificar se já existe uma resposta para esta pergunta nesta aplicação
    const existingResponse = await this.questionResponseRepository.findOne({
      where: {
        applicationId,
        jobQuestionId: createQuestionResponseDto.jobQuestionId,
      },
    });

    if (existingResponse) {
      throw new BadRequestException('Response already exists for this question in this application');
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

  async findAllByApplication(applicationId: string): Promise<ApplicationQuestionResponse[]> {
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