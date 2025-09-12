import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationsService } from './applications.service';
import { Application } from '../entities/application.entity';
import { Job } from '../../jobs/entities/job.entity';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationScoreDto } from '../dto/update-application-score.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { S3ClientService } from '../../shared/services/s3-client.service';
import { SqsClientService } from '../../shared/services/sqs-client.service';
import { CandidateEvaluationService } from './candidate-evaluation.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let applicationsRepository: Repository<Application>;
  let jobsRepository: Repository<Job>;

  const mockApplicationsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockJobsRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    }),
  };

  const mockS3ClientService = {
    uploadFile: jest.fn(),
    getPresignedUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockSqsClientService = {
    sendMessage: jest.fn(),
    receiveMessages: jest.fn(),
    deleteMessage: jest.fn(),
  };

  const mockCandidateEvaluationService = {
    evaluateCandidate: jest.fn(),
    updateEvaluation: jest.fn(),
  };

  const mockAsyncTaskQueue = {
    sendMessage: jest.fn(),
    sendApplicationCreatedMessage: jest.fn(),
    sendQuestionResponseMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationsRepository,
        },
        {
          provide: getRepositoryToken(Job),
          useValue: mockJobsRepository,
        },
        {
          provide: S3ClientService,
          useValue: mockS3ClientService,
        },
        {
          provide: SqsClientService,
          useValue: mockSqsClientService,
        },
        {
          provide: CandidateEvaluationService,
          useValue: mockCandidateEvaluationService,
        },
        {
          provide: 'AsyncTaskQueue',
          useValue: mockAsyncTaskQueue,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    applicationsRepository = module.get<Repository<Application>>(
      getRepositoryToken(Application),
    );
    jobsRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an application successfully', async () => {
      const createDto: CreateApplicationDto = {
        jobId: 'job-uuid',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@email.com',
      };

      const mockJob = {
        id: 'job-uuid',
        companyId: 'company-uuid',
        status: 'PUBLISHED',
      };

      const mockApplication = {
        id: 'app-uuid',
        ...createDto,
        companyId: 'company-uuid',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJobsRepository.findOne.mockResolvedValue(mockJob);
      mockJobsRepository.createQueryBuilder().getOne.mockResolvedValue({
        id: 'job-uuid',
        stages: [
          {
            id: 'stage-uuid',
            isActive: true,
            orderIndex: 1,
          },
        ],
      });
      mockApplicationsRepository.create.mockReturnValue(mockApplication);
      mockApplicationsRepository.save.mockResolvedValue(mockApplication);

      const result = await service.create(createDto);

      expect(result).toEqual(mockApplication);
      expect(mockJobsRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.jobId },
        select: ['id', 'companyId', 'status'],
      });
    });

    it('should throw NotFoundException when job does not exist', async () => {
      const createDto: CreateApplicationDto = {
        jobId: 'non-existent-job',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@email.com',
      };

      mockJobsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when job is not published', async () => {
      const createDto: CreateApplicationDto = {
        jobId: 'job-uuid',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@email.com',
      };

      const mockJob = {
        id: 'job-uuid',
        companyId: 'company-uuid',
        status: 'DRAFT',
      };

      mockJobsRepository.findOne.mockResolvedValue(mockJob);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when neither email nor phone is provided', async () => {
      const createDto: CreateApplicationDto = {
        jobId: 'job-uuid',
        firstName: 'João',
        lastName: 'Silva',
      };

      const mockJob = {
        id: 'job-uuid',
        companyId: 'company-uuid',
        status: 'PUBLISHED',
      };

      mockJobsRepository.findOne.mockResolvedValue(mockJob);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateAiScore', () => {
    it('should update ai score successfully', async () => {
      const updateScoreDto: UpdateApplicationScoreDto = {
        aiScore: 85.5,
      };

      const mockApplication = {
        id: 'app-uuid',
        jobId: 'job-uuid',
        companyId: 'company-uuid',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@email.com',
        aiScore: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedApplication = {
        ...mockApplication,
        aiScore: 85.5,
      };

      mockApplicationsRepository.findOne.mockResolvedValue(mockApplication);
      mockApplicationsRepository.save.mockResolvedValue(updatedApplication);

      const result = await service.updateAiScore(
        'app-uuid',
        updateScoreDto,
        'company-uuid',
      );

      expect(result).toEqual(updatedApplication);
      expect(mockApplicationsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'app-uuid', companyId: 'company-uuid' },
        relations: [
          'job',
          'questionResponses',
          'questionResponses.jobQuestion',
        ],
        order: {
          questionResponses: {
            createdAt: 'ASC',
          },
        },
      });
      expect(mockApplicationsRepository.save).toHaveBeenCalledWith(
        updatedApplication,
      );
    });

    it('should throw NotFoundException when application does not exist', async () => {
      const updateScoreDto: UpdateApplicationScoreDto = {
        aiScore: 85.5,
      };

      mockApplicationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateAiScore(
          'non-existent-app',
          updateScoreDto,
          'company-uuid',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
