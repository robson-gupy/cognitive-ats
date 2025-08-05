import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { Job } from './entities/job.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
});
