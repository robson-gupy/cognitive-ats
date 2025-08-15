import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from './jobs.service';
import { Job, JobStatus } from './entities/job.entity';
import { JobQuestion } from './entities/job-question.entity';
import { JobStage } from './entities/job-stage.entity';
import { JobLog } from './entities/job-log.entity';
import { Application } from './entities/application.entity';
import { ApplicationStageHistory } from './entities/application-stage-history.entity';
import { AiServiceClient } from './ai-service.client';
import { BadRequestException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: Repository<Job>;
  let jobQuestionRepository: Repository<JobQuestion>;
  let jobStageRepository: Repository<JobStage>;
  let jobLogRepository: Repository<JobLog>;
  let aiServiceClient: AiServiceClient;

  const mockUser = {
    id: 'user-1',
    companyId: 'company-1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
  };

  const mockJob = {
    id: 'job-1',
    title: 'Test Job',
    description: 'Test Description',
    requirements: 'Test Requirements',
    status: JobStatus.DRAFT,
    companyId: 'company-1',
    departmentId: 'dept-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStages = [
    {
      id: 'stage-1',
      name: 'Triagem',
      description: 'Avaliação inicial',
      orderIndex: 0,
      isActive: true,
      jobId: 'job-1',
    },
    {
      id: 'stage-2',
      name: 'Entrevista',
      description: 'Entrevista com candidatos',
      orderIndex: 1,
      isActive: true,
      jobId: 'job-1',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            query: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(JobQuestion),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(JobStage),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            query: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(JobLog),
          useValue: {
            find: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Application),
          useValue: {
            find: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApplicationStageHistory),
          useValue: {
            find: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: AiServiceClient,
          useValue: {
            createJob: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobRepository = module.get<Repository<Job>>(getRepositoryToken(Job));
    jobQuestionRepository = module.get<Repository<JobQuestion>>(getRepositoryToken(JobQuestion));
    jobStageRepository = module.get<Repository<JobStage>>(getRepositoryToken(JobStage));
    jobLogRepository = module.get<Repository<JobLog>>(getRepositoryToken(JobLog));
    aiServiceClient = module.get<AiServiceClient>(AiServiceClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasStageChanges', () => {
    it('should return true when stages have different lengths', () => {
      const existingStages = mockStages;
      const newStages = [mockStages[0]]; // Different length

      const result = (service as any).hasStageChanges(existingStages, newStages);
      expect(result).toBe(true);
    });

    it('should return true when stage properties have changed', () => {
      const existingStages = mockStages;
      const newStages = [
        { ...mockStages[0], name: 'Triagem Atualizada' }, // Name changed
        mockStages[1],
      ];

      const result = (service as any).hasStageChanges(existingStages, newStages);
      expect(result).toBe(true);
    });

    it('should return false when stages are identical', () => {
      const existingStages = mockStages;
      const newStages = [...mockStages]; // Same stages

      const result = (service as any).hasStageChanges(existingStages, newStages);
      expect(result).toBe(false);
    });

    it('should return true when new stage has no ID', () => {
      const existingStages = mockStages;
      const newStages = [
        { name: 'Nova Etapa', description: 'Nova', orderIndex: 0, isActive: true }, // No ID
        mockStages[1],
      ];

      const result = (service as any).hasStageChanges(existingStages, newStages);
      expect(result).toBe(true);
    });
  });

  describe('createLog', () => {
    it('should create a job log entry', async () => {
      // Arrange
      const logData = {
        jobId: 'job-1',
        userId: 'user-1',
        description: 'Test log',
        fieldName: 'title',
        oldValue: 'Old Title',
        newValue: 'New Title',
      };

      jest.spyOn(jobLogRepository, 'query').mockResolvedValue(undefined);

      // Act
      await service.createLog(
        logData.jobId,
        logData.userId,
        logData.description,
        logData.fieldName,
        logData.oldValue,
        logData.newValue
      );

      // Assert
      expect(jobLogRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO job_logs'),
        expect.arrayContaining([
          logData.jobId,
          logData.userId,
          logData.description,
          logData.fieldName,
          logData.oldValue,
          logData.newValue,
        ])
      );
    });
  });

  describe('publish', () => {
    it('should publish a draft job', async () => {
      // Arrange
      const draftJob = { ...mockJob, status: JobStatus.DRAFT };
      const publishedJob = { ...mockJob, status: JobStatus.PUBLISHED, publishedAt: new Date() };

      jest.spyOn(service, 'findOne').mockResolvedValue(draftJob as Job);
      jest.spyOn(jobRepository, 'save').mockResolvedValue(publishedJob as Job);
      jest.spyOn(service, 'createLog').mockResolvedValue(undefined);

      // Act
      await service.publish('job-1', mockUser as any);

      // Assert
      expect(jobRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: JobStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        })
      );
      expect(service.createLog).toHaveBeenCalledWith(
        'job-1',
        mockUser.id,
        'Vaga publicada',
        'status',
        JobStatus.DRAFT,
        JobStatus.PUBLISHED
      );
    });

    it('should throw error when trying to publish non-draft job', async () => {
      // Arrange
      const publishedJob = { ...mockJob, status: JobStatus.PUBLISHED };

      jest.spyOn(service, 'findOne').mockResolvedValue(publishedJob as Job);

      // Act & Assert
      await expect(service.publish('job-1', mockUser as any)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('close', () => {
    it('should close a published job', async () => {
      // Arrange
      const publishedJob = { ...mockJob, status: JobStatus.PUBLISHED };
      const closedJob = { ...mockJob, status: JobStatus.CLOSED, closedAt: new Date() };

      jest.spyOn(service, 'findOne').mockResolvedValue(publishedJob as Job);
      jest.spyOn(jobRepository, 'save').mockResolvedValue(closedJob as Job);
      jest.spyOn(service, 'createLog').mockResolvedValue(undefined);

      // Act
      await service.close('job-1', mockUser as any);

      // Assert
      expect(jobRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: JobStatus.CLOSED,
          closedAt: expect.any(Date),
        })
      );
      expect(service.createLog).toHaveBeenCalledWith(
        'job-1',
        mockUser.id,
        'Vaga fechada',
        'status',
        JobStatus.PUBLISHED,
        JobStatus.CLOSED
      );
    });
  });
});
