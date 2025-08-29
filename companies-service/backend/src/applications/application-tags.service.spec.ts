import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationTagsService } from './services/application-tags.service';
import { ApplicationTag } from './entities/application-tag.entity';
import { Application } from './entities/application.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { CreateApplicationTagDto } from './dto/create-application-tag.dto';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('ApplicationTagsService', () => {
  let service: ApplicationTagsService;
  let applicationTagRepository: Repository<ApplicationTag>;
  let applicationRepository: Repository<Application>;
  let tagRepository: Repository<Tag>;
  let userRepository: Repository<User>;

  const mockApplicationTagRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockApplicationRepository = {
    findOne: jest.fn(),
  };

  const mockTagRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTagsService,
        {
          provide: getRepositoryToken(ApplicationTag),
          useValue: mockApplicationTagRepository,
        },
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: mockTagRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationTagsService>(ApplicationTagsService);
    applicationTagRepository = module.get<Repository<ApplicationTag>>(getRepositoryToken(ApplicationTag));
    applicationRepository = module.get<Repository<Application>>(getRepositoryToken(Application));
    tagRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Configurar mock do query builder
    mockApplicationTagRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new application tag successfully', async () => {
      const createDto: CreateApplicationTagDto = {
        applicationId: 'app-123',
        tagId: 'tag-123',
      };
      const userId = 'user-123';
      const companyId = 'company-123';

      const mockApplication = {
        id: 'app-123',
        job: { title: 'Software Engineer' },
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockTag = {
        id: 'tag-123',
        companyId: 'company-123',
      };

      const mockApplicationTag = {
        id: 'at-123',
        applicationId: 'app-123',
        tagId: 'tag-123',
        addedByUserId: 'user-123',
        createdAt: new Date(),
      };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockTagRepository.findOne.mockResolvedValue(mockTag);
      mockApplicationTagRepository.findOne.mockResolvedValue(null);
      mockApplicationTagRepository.create.mockReturnValue(mockApplicationTag);
      mockApplicationTagRepository.save.mockResolvedValue(mockApplicationTag);

      const result = await service.create(createDto, userId, companyId);

      expect(result).toBeDefined();
      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.applicationId },
        relations: ['job'],
      });
      expect(mockTagRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.tagId, companyId },
      });
    });

    it('should throw NotFoundException if application not found', async () => {
      const createDto: CreateApplicationTagDto = {
        applicationId: 'app-123',
        tagId: 'tag-123',
      };
      const userId = 'user-123';
      const companyId = 'company-123';

      mockApplicationRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, userId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if tag not found', async () => {
      const createDto: CreateApplicationTagDto = {
        applicationId: 'app-123',
        tagId: 'tag-123',
      };
      const userId = 'user-123';
      const companyId = 'company-123';

      const mockApplication = { id: 'app-123' };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockTagRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, userId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if tag already exists for application', async () => {
      const createDto: CreateApplicationTagDto = {
        applicationId: 'app-123',
        tagId: 'tag-123',
      };
      const userId = 'user-123';
      const companyId = 'company-123';

      const mockApplication = { id: 'app-123' };
      const mockTag = { id: 'tag-123', companyId: 'company-123' };
      const existingApplicationTag = { id: 'existing-at' };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockTagRepository.findOne.mockResolvedValue(mockTag);
      mockApplicationTagRepository.findOne.mockResolvedValue(existingApplicationTag);

      await expect(service.create(createDto, userId, companyId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllByApplication', () => {
    it('should return all tags for an application', async () => {
      const applicationId = 'app-123';
      const companyId = 'company-123';

      const mockApplication = { id: 'app-123' };
      const mockApplicationTags = [
        {
          id: 'at-1',
          tag: { id: 'tag-1', label: 'Tag 1' },
          addedByUser: { id: 'user-1', firstName: 'John' },
        },
      ];

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);
      mockApplicationTagRepository.find.mockResolvedValue(mockApplicationTags);

      const result = await service.findAllByApplication(applicationId, companyId);

      expect(result).toHaveLength(1);
      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { id: applicationId },
        relations: ['job'],
      });
    });

    it('should throw NotFoundException if application not found', async () => {
      const applicationId = 'app-123';
      const companyId = 'company-123';

      mockApplicationRepository.findOne.mockResolvedValue(null);

      await expect(service.findAllByApplication(applicationId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllByTag', () => {
    it('should return all applications for a tag', async () => {
      const tagId = 'tag-123';
      const companyId = 'company-123';

      const mockTag = { id: 'tag-123', companyId: 'company-123' };
      const mockApplicationTags = [
        {
          id: 'at-1',
          application: { id: 'app-1' },
          addedByUser: { id: 'user-1' },
        },
      ];

      mockTagRepository.findOne.mockResolvedValue(mockTag);
      mockApplicationTagRepository.find.mockResolvedValue(mockApplicationTags);

      const result = await service.findAllByTag(tagId, companyId);

      expect(result).toHaveLength(1);
      expect(mockTagRepository.findOne).toHaveBeenCalledWith({
        where: { id: tagId, companyId },
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      const tagId = 'tag-123';
      const companyId = 'company-123';

      mockTagRepository.findOne.mockResolvedValue(null);

      await expect(service.findAllByTag(tagId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an application tag by id', async () => {
      const id = 'at-123';
      const companyId = 'company-123';

      const mockApplicationTag = {
        id: 'at-123',
        tag: { id: 'tag-123', companyId: 'company-123' },
        application: { id: 'app-123' },
        addedByUser: { id: 'user-123' },
      };

      mockApplicationTagRepository.findOne.mockResolvedValue(mockApplicationTag);

      const result = await service.findOne(id, companyId);

      expect(result).toBeDefined();
      expect(mockApplicationTagRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['tag', 'application', 'application.job', 'addedByUser'],
      });
    });

    it('should throw NotFoundException if application tag not found', async () => {
      const id = 'at-123';
      const companyId = 'company-123';

      mockApplicationTagRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if tag does not belong to company', async () => {
      const id = 'at-123';
      const companyId = 'company-123';

      const mockApplicationTag = {
        id: 'at-123',
        tag: { id: 'tag-123', companyId: 'different-company' },
      };

      mockApplicationTagRepository.findOne.mockResolvedValue(mockApplicationTag);

      await expect(service.findOne(id, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an application tag successfully', async () => {
      const id = 'at-123';
      const userId = 'user-123';
      const companyId = 'company-123';

      const mockApplicationTag = {
        id: 'at-123',
        tag: { id: 'tag-123', companyId: 'company-123' },
        addedByUserId: 'user-123',
      };

      mockApplicationTagRepository.findOne.mockResolvedValue(mockApplicationTag);
      mockApplicationTagRepository.remove.mockResolvedValue(undefined);

      await service.remove(id, userId, companyId);

      expect(mockApplicationTagRepository.remove).toHaveBeenCalledWith(mockApplicationTag);
    });

    it('should throw NotFoundException if application tag not found', async () => {
      const id = 'at-123';
      const userId = 'user-123';
      const companyId = 'company-123';

      mockApplicationTagRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id, userId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if tag does not belong to company', async () => {
      const id = 'at-123';
      const userId = 'user-123';
      const companyId = 'company-123';

      const mockApplicationTag = {
        id: 'at-123',
        tag: { id: 'tag-123', companyId: 'different-company' },
      };

      mockApplicationTagRepository.findOne.mockResolvedValue(mockApplicationTag);

      await expect(service.remove(id, userId, companyId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getApplicationTagsSummary', () => {
    it('should return tags usage summary', async () => {
      const companyId = 'company-123';
      const mockSummary = [
        { tagId: 'tag-1', tagLabel: 'Tag 1', usageCount: '5' },
        { tagId: 'tag-2', tagLabel: 'Tag 2', usageCount: '3' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockSummary);

      const result = await service.getApplicationTagsSummary(companyId);

      expect(result).toEqual(mockSummary);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('tag.companyId = :companyId', { companyId });
    });
  });
});
