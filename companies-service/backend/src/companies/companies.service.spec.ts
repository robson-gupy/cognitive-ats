import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { generateUniqueSlug } from '../shared/utils/slug.util';

// Mock da função generateUniqueSlug
jest.mock('../shared/utils/slug.util', () => ({
  generateUniqueSlug: jest.fn(),
}));

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repository: Repository<Company>;
  let mockRepository: jest.Mocked<Repository<Company>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    repository = module.get<Repository<Company>>(getRepositoryToken(Company));
    mockRepository = repository as jest.Mocked<Repository<Company>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCompanyDto: CreateCompanyDto = {
      name: 'Test Company',
      corporateName: 'Test Company LTDA',
      cnpj: '12345678901234',
      businessArea: 'Technology',
      description: 'Test description',
      slug: 'test-company',
    };

    const mockCompany: Company = {
      id: '1',
      name: 'Test Company',
      corporateName: 'Test Company LTDA',
      cnpj: '12345678901234',
      businessArea: 'Technology',
      description: 'Test description',
      slug: 'test-company',
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [],
      departments: [],
      jobs: [],
    };

    it('should create a company successfully with slug provided', async () => {
      // Mock: CNPJ não existe
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      // Mock: Slug não existe
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      // Mock: Criação da empresa
      mockRepository.create.mockReturnValue(mockCompany);
      mockRepository.save.mockResolvedValue(mockCompany);

      const result = await service.create(createCompanyDto);

      expect(result).toEqual(mockCompany);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cnpj: createCompanyDto.cnpj },
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: createCompanyDto.slug },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createCompanyDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCompany);
    });

    it('should create a company successfully without slug (auto-generated)', async () => {
      const dtoWithoutSlug = { ...createCompanyDto };
      delete dtoWithoutSlug.slug;

      const mockCompanyWithoutSlug = { ...mockCompany, slug: 'auto-generated-slug' };

      // Mock: CNPJ não existe
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      // Mock: Buscar slugs existentes
      mockRepository.find.mockResolvedValueOnce([]);
      
      // Mock: Função de geração de slug
      (generateUniqueSlug as jest.Mock).mockReturnValue('auto-generated-slug');
      
      // Mock: Criação da empresa
      mockRepository.create.mockReturnValue(mockCompanyWithoutSlug);
      mockRepository.save.mockResolvedValue(mockCompanyWithoutSlug);

      const result = await service.create(dtoWithoutSlug);

      expect(result).toEqual(mockCompanyWithoutSlug);
      expect(generateUniqueSlug).toHaveBeenCalledWith(
        null,
        dtoWithoutSlug.name,
        []
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dtoWithoutSlug,
        slug: 'auto-generated-slug',
      });
    });

    it('should throw ConflictException when CNPJ already exists', async () => {
      // Mock: CNPJ já existe
      mockRepository.findOne.mockResolvedValueOnce(mockCompany);

      await expect(service.create(createCompanyDto)).rejects.toThrow(
        ConflictException
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cnpj: createCompanyDto.cnpj },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when slug already exists', async () => {
      // Mock: CNPJ não existe
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      // Mock: Slug já existe
      mockRepository.findOne.mockResolvedValueOnce(mockCompany);

      await expect(service.create(createCompanyDto)).rejects.toThrow(
        ConflictException
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cnpj: createCompanyDto.cnpj },
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: createCompanyDto.slug },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle auto-generated slug with existing slugs', async () => {
      const dtoWithoutSlug = { ...createCompanyDto };
      delete dtoWithoutSlug.slug;

      const existingSlugs = ['test-company', 'test-company-1'];
      const mockCompanyWithNewSlug = { ...mockCompany, slug: 'test-company-2' };

      // Mock: CNPJ não existe
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      // Mock: Buscar slugs existentes
      mockRepository.find.mockResolvedValueOnce(
        existingSlugs.map(slug => ({ 
          id: '1', 
          name: 'Test Company', 
          corporateName: 'Test Company LTDA',
          cnpj: '12345678901234',
          businessArea: 'Technology',
          description: 'Test description',
          slug,
          createdAt: new Date(),
          updatedAt: new Date(),
          users: [],
          departments: [],
          jobs: []
        }))
      );
      
      // Mock: Função de geração de slug
      (generateUniqueSlug as jest.Mock).mockReturnValue('test-company-2');
      
      // Mock: Criação da empresa
      mockRepository.create.mockReturnValue(mockCompanyWithNewSlug);
      mockRepository.save.mockResolvedValue(mockCompanyWithNewSlug);

      const result = await service.create(dtoWithoutSlug);

      expect(result).toEqual(mockCompanyWithNewSlug);
      expect(generateUniqueSlug).toHaveBeenCalledWith(
        null,
        dtoWithoutSlug.name,
        existingSlugs
      );
    });

    it('should generate slug without prefix when prefix is null', async () => {
      const dtoWithoutSlug = { ...createCompanyDto };
      delete dtoWithoutSlug.slug;

      const mockCompanyWithoutSlug = { ...mockCompany, slug: 'test-company-1' };

      // Mock: CNPJ não existe
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      // Mock: Buscar slugs existentes (incluindo o slug base)
      mockRepository.find.mockResolvedValueOnce([
        { 
          id: '1', 
          name: 'Test Company', 
          corporateName: 'Test Company LTDA',
          cnpj: '12345678901234',
          businessArea: 'Technology',
          description: 'Test description',
          slug: 'test-company',
          createdAt: new Date(),
          updatedAt: new Date(),
          users: [],
          departments: [],
          jobs: []
        }
      ]);
      
      // Mock: Função de geração de slug
      (generateUniqueSlug as jest.Mock).mockReturnValue('test-company-1');
      
      // Mock: Criação da empresa
      mockRepository.create.mockReturnValue(mockCompanyWithoutSlug);
      mockRepository.save.mockResolvedValue(mockCompanyWithoutSlug);

      const result = await service.create(dtoWithoutSlug);

      expect(result).toEqual(mockCompanyWithoutSlug);
      expect(generateUniqueSlug).toHaveBeenCalledWith(
        null,
        dtoWithoutSlug.name,
        ['test-company']
      );
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const mockCompanies = [
        { 
          id: '1', 
          name: 'Company 1',
          corporateName: 'Company 1 LTDA',
          cnpj: '12345678901234',
          businessArea: 'Technology',
          description: 'Test description',
          slug: 'company-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          users: [],
          departments: [],
          jobs: []
        },
        { 
          id: '2', 
          name: 'Company 2',
          corporateName: 'Company 2 LTDA',
          cnpj: '12345678901235',
          businessArea: 'Technology',
          description: 'Test description',
          slug: 'company-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          users: [],
          departments: [],
          jobs: []
        },
      ];

      mockRepository.find.mockResolvedValue(mockCompanies);

      const result = await service.findAll();

      expect(result).toEqual(mockCompanies);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const mockCompany = { 
        id: '1', 
        name: 'Company 1',
        corporateName: 'Company 1 LTDA',
        cnpj: '12345678901234',
        businessArea: 'Technology',
        description: 'Test description',
        slug: 'company-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        departments: [],
        jobs: []
      };

      mockRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCompany);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['users'],
      });
    });
  });

  describe('findBySlug', () => {
    it('should return a company by slug', async () => {
      const mockCompany = { 
        id: '1', 
        name: 'Company 1',
        corporateName: 'Company 1 LTDA',
        cnpj: '12345678901234',
        businessArea: 'Technology',
        description: 'Test description',
        slug: 'company-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        departments: [],
        jobs: []
      };

      mockRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.findBySlug('company-1');

      expect(result).toEqual(mockCompany);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'company-1' },
        relations: ['users'],
      });
    });
  });

  describe('checkSlugAvailability', () => {
    it('should return true when slug is available', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.checkSlugAvailability('available-slug');

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'available-slug' },
      });
    });

    it('should return false when slug is not available', async () => {
      const mockCompany = { 
        id: '1',
        name: 'Company 1',
        corporateName: 'Company 1 LTDA',
        cnpj: '12345678901234',
        businessArea: 'Technology',
        description: 'Test description',
        slug: 'existing-slug',
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        departments: [],
        jobs: []
      };

      mockRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.checkSlugAvailability('existing-slug');

      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'existing-slug' },
      });
    });
  });
});
