import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionResponsesService } from './question-responses.service';
import { ApplicationQuestionResponse } from '../entities/application-question-response.entity';
import { JobQuestion } from '../../jobs/entities/job-question.entity';
import { Application } from '../entities/application.entity';
import { SqsClientService } from '../../shared/services/sqs-client.service';
import { CreateQuestionResponseDto } from '../dto/create-question-response.dto';
import { CreateMultipleQuestionResponsesDto } from '../dto/create-multiple-question-responses.dto';
import { NotFoundException } from '@nestjs/common';
import { AsyncTaskQueue } from '../../shared/interfaces/async-task-queue.interface';

describe('QuestionResponsesService', () => {
  let service: QuestionResponsesService;
  let questionResponseRepository: Repository<ApplicationQuestionResponse>;
  let jobQuestionRepository: Repository<JobQuestion>;
  let applicationRepository: Repository<Application>;
  let sqsClientService: SqsClientService;

  const mockQuestionResponseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockJobQuestionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockApplicationRepository = {
    findOne: jest.fn(),
  };

  const mockSqsClientService = {
    sendMessage: jest.fn(),
  };

  const mockAsyncTaskQueue = {
    sendMessage: jest.fn(),
    sendApplicationCreatedMessage: jest.fn(),
    sendQuestionResponseMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionResponsesService,
        {
          provide: getRepositoryToken(ApplicationQuestionResponse),
          useValue: mockQuestionResponseRepository,
        },
        {
          provide: getRepositoryToken(JobQuestion),
          useValue: mockJobQuestionRepository,
        },
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: SqsClientService,
          useValue: mockSqsClientService,
        },
        {
          provide: 'AsyncTaskQueue',
          useValue: mockAsyncTaskQueue,
        },
      ],
    }).compile();

    service = module.get<QuestionResponsesService>(QuestionResponsesService);
    questionResponseRepository = module.get<
      Repository<ApplicationQuestionResponse>
    >(getRepositoryToken(ApplicationQuestionResponse));
    jobQuestionRepository = module.get<Repository<JobQuestion>>(
      getRepositoryToken(JobQuestion),
    );
    applicationRepository = module.get<Repository<Application>>(
      getRepositoryToken(Application),
    );
    sqsClientService = module.get<SqsClientService>(SqsClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a question response and emit SQS event', async () => {
      const applicationId = 'test-application-id';
      const createDto: CreateQuestionResponseDto = {
        jobQuestionId: 'test-question-id',
        answer: 'Test answer',
      };

      const mockApplication = {
        id: applicationId,
        jobId: 'test-job-id',
        companyId: 'test-company-id',
        job: {
          id: 'test-job-id',
          title: 'Test Job',
          slug: 'test-job',
          description: 'Test description',
          requirements: 'Test requirements',
        },
        company: {
          id: 'test-company-id',
          name: 'Test Company',
          slug: 'test-company',
        },
      };

      const mockJobQuestion = {
        id: 'test-question-id',
        question: 'Test question?',
        jobId: 'test-job-id',
      };

      const mockQuestionResponse = {
        id: 'test-response-id',
        applicationId,
        jobId: 'test-job-id',
        companyId: 'test-company-id',
        jobQuestionId: 'test-question-id',
        question: 'Test question?',
        answer: 'Test answer',
        createdAt: new Date(),
      };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockJobQuestionRepository.findOne.mockResolvedValue(mockJobQuestion);
      mockQuestionResponseRepository.findOne.mockResolvedValue(null);
      mockQuestionResponseRepository.create.mockReturnValue(
        mockQuestionResponse,
      );
      mockQuestionResponseRepository.save.mockResolvedValue(
        mockQuestionResponse,
      );
      mockAsyncTaskQueue.sendMessage.mockResolvedValue(undefined);

      const result = await service.create(applicationId, createDto);

      expect(result).toEqual(mockQuestionResponse);
      expect(mockAsyncTaskQueue.sendMessage).toHaveBeenCalledWith(
        'question-responses-queue',
        expect.objectContaining({
          eventType: 'QUESTION_RESPONSE_CREATED',
          data: expect.objectContaining({
            questionResponseId: mockQuestionResponse.id,
            applicationId: mockQuestionResponse.applicationId,
          }),
        }),
      );
    });

    it('should throw NotFoundException when application not found', async () => {
      const applicationId = 'non-existent-application-id';
      const createDto: CreateQuestionResponseDto = {
        jobQuestionId: 'test-question-id',
        answer: 'Test answer',
      };

      mockApplicationRepository.findOne.mockResolvedValue(null);

      await expect(service.create(applicationId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createMultiple', () => {
    it('should create multiple question responses and emit SQS event', async () => {
      const applicationId = 'test-application-id';
      const createDto: CreateMultipleQuestionResponsesDto = {
        responses: [
          {
            jobQuestionId: 'test-question-1',
            answer: 'Test answer 1',
          },
          {
            jobQuestionId: 'test-question-2',
            answer: 'Test answer 2',
          },
        ],
      };

      const mockApplication = {
        id: applicationId,
        jobId: 'test-job-id',
        companyId: 'test-company-id',
        job: {
          id: 'test-job-id',
          title: 'Test Job',
          slug: 'test-job',
          description: 'Test description',
          requirements: 'Test requirements',
        },
        company: {
          id: 'test-company-id',
          name: 'Test Company',
          slug: 'test-company',
        },
      };

      const mockJobQuestions = [
        {
          id: 'test-question-1',
          question: 'Test question 1?',
          jobId: 'test-job-id',
        },
        {
          id: 'test-question-2',
          question: 'Test question 2?',
          jobId: 'test-job-id',
        },
      ];

      const mockQuestionResponses = [
        {
          id: 'test-response-1',
          applicationId,
          jobId: 'test-job-id',
          companyId: 'test-company-id',
          jobQuestionId: 'test-question-1',
          question: 'Test question 1?',
          answer: 'Test answer 1',
          createdAt: new Date(),
        },
        {
          id: 'test-response-2',
          applicationId,
          jobId: 'test-job-id',
          companyId: 'test-company-id',
          jobQuestionId: 'test-question-2',
          question: 'Test question 2?',
          answer: 'Test answer 2',
          createdAt: new Date(),
        },
      ];

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockJobQuestionRepository.find.mockResolvedValue(mockJobQuestions);
      mockQuestionResponseRepository.find.mockResolvedValue([]);
      mockQuestionResponseRepository.create.mockReturnValue(
        mockQuestionResponses[0],
      );
      mockQuestionResponseRepository.save.mockResolvedValue(
        mockQuestionResponses,
      );
      mockAsyncTaskQueue.sendMessage.mockResolvedValue(undefined);

      const result = await service.createMultiple(applicationId, createDto);

      expect(result).toEqual(mockQuestionResponses);
      expect(mockAsyncTaskQueue.sendMessage).toHaveBeenCalledWith(
        'question-responses-queue',
        expect.objectContaining({
          eventType: 'MULTIPLE_QUESTION_RESPONSES_CREATED',
          data: expect.objectContaining({
            totalResponses: 2,
            applicationId: mockApplication.id,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a question response and emit SQS event', async () => {
      const responseId = 'test-response-id';
      const updateDto = {
        answer: 'Updated answer',
      };

      const mockExistingResponse = {
        id: responseId,
        applicationId: 'test-application-id',
        jobId: 'test-job-id',
        companyId: 'test-company-id',
        jobQuestionId: 'test-question-id',
        question: 'Test question?',
        answer: 'Old answer',
        createdAt: new Date(),
      };

      const mockUpdatedResponse = {
        ...mockExistingResponse,
        answer: 'Updated answer',
      };

      const mockApplication = {
        id: 'test-application-id',
        jobId: 'test-job-id',
        companyId: 'test-company-id',
        job: {
          id: 'test-job-id',
          title: 'Test Job',
          slug: 'test-job',
          description: 'Test description',
          requirements: 'Test requirements',
        },
        company: {
          id: 'test-company-id',
          name: 'Test Company',
          slug: 'test-company',
        },
      };

      mockQuestionResponseRepository.findOne.mockResolvedValue(
        mockExistingResponse,
      );
      mockQuestionResponseRepository.save.mockResolvedValue(
        mockUpdatedResponse,
      );
      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockAsyncTaskQueue.sendMessage.mockResolvedValue(undefined);

      const result = await service.update(responseId, updateDto);

      expect(result).toEqual(mockUpdatedResponse);
      expect(mockAsyncTaskQueue.sendMessage).toHaveBeenCalledWith(
        'question-responses-queue',
        expect.objectContaining({
          eventType: 'QUESTION_RESPONSE_CREATED',
          data: expect.objectContaining({
            questionResponseId: mockUpdatedResponse.id,
            answer: 'Updated answer',
          }),
        }),
      );
    });
  });
});
