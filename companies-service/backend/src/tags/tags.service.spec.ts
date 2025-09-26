import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagsService } from './services/tags.service';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let repository: Repository<Tag>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    repository = module.get<Repository<Tag>>(getRepositoryToken(Tag));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag successfully', async () => {
      const createTagDto: CreateTagDto = {
        label: 'Test Tag',
        color: '#FF0000',
        textColor: '#FFFFFF',
      };
      const companyId = 'company-123';
      const mockTag = {
        id: 'tag-123',
        ...createTagDto,
        companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTag);
      mockRepository.save.mockResolvedValue(mockTag);

      const result = await service.create(createTagDto, companyId);

      expect(result).toEqual({
        id: mockTag.id,
        label: mockTag.label,
        companyId: mockTag.companyId,
        color: mockTag.color,
        textColor: mockTag.textColor,
        createdAt: mockTag.createdAt,
        updatedAt: mockTag.updatedAt,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { label: createTagDto.label, companyId },
      });
    });

    it('should throw ConflictException if tag with same label exists', async () => {
      const createTagDto: CreateTagDto = {
        label: 'Test Tag',
      };
      const companyId = 'company-123';
      const existingTag = { id: 'existing-tag' };

      mockRepository.findOne.mockResolvedValue(existingTag);

      await expect(service.create(createTagDto, companyId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all tags for a company', async () => {
      const companyId = 'company-123';
      const mockTags = [
        {
          id: 'tag-1',
          label: 'Tag 1',
          companyId,
          color: '#FF0000',
          textColor: '#FFFFFF',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tag-2',
          label: 'Tag 2',
          companyId,
          color: '#00FF00',
          textColor: '#000000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockTags);

      const result = await service.findAll(companyId);

      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { companyId },
        order: { label: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const id = 'tag-123';
      const companyId = 'company-123';
      const mockTag = {
        id,
        label: 'Test Tag',
        companyId,
        color: '#FF0000',
        textColor: '#FFFFFF',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockTag);

      const result = await service.findOne(id, companyId);

      expect(result).toEqual({
        id: mockTag.id,
        label: mockTag.label,
        companyId: mockTag.companyId,
        color: mockTag.color,
        textColor: mockTag.textColor,
        createdAt: mockTag.createdAt,
        updatedAt: mockTag.updatedAt,
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      const id = 'tag-123';
      const companyId = 'company-123';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a tag successfully', async () => {
      const id = 'tag-123';
      const companyId = 'company-123';
      const updateTagDto: UpdateTagDto = {
        label: 'Updated Tag',
        color: '#00FF00',
      };
      const existingTag = {
        id,
        label: 'Old Tag',
        companyId,
        color: '#FF0000',
        textColor: '#FFFFFF',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedTag = { ...existingTag, ...updateTagDto };

      mockRepository.findOne
        .mockResolvedValueOnce(existingTag) // First call for finding existing tag
        .mockResolvedValueOnce(null); // Second call for checking duplicate label
      mockRepository.save.mockResolvedValue(updatedTag);

      const result = await service.update(id, updateTagDto, companyId);

      expect(result).toEqual({
        id: updatedTag.id,
        label: updatedTag.label,
        companyId: updatedTag.companyId,
        color: updatedTag.color,
        textColor: updatedTag.textColor,
        createdAt: updatedTag.createdAt,
        updatedAt: updatedTag.updatedAt,
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      const id = 'tag-123';
      const companyId = 'company-123';
      const updateTagDto: UpdateTagDto = { label: 'Updated Tag' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateTagDto, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a tag successfully', async () => {
      const id = 'tag-123';
      const companyId = 'company-123';
      const mockTag = {
        id,
        label: 'Test Tag',
        companyId,
        color: '#FF0000',
        textColor: '#FFFFFF',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockTag);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(id, companyId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      const id = 'tag-123';
      const companyId = 'company-123';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
