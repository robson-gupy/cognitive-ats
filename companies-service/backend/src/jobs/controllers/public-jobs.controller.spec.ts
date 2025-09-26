import { Test, TestingModule } from '@nestjs/testing';
import { PublicJobsController } from './public-jobs.controller';
import { JobsService } from '../services/jobs.service';
import { CompaniesService } from '../../companies/companies.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PublicJobsController', () => {
  let controller: PublicJobsController;
  let jobsService: JobsService;
  let companiesService: CompaniesService;

  const mockJobsService = {
    findPublishedJobsByCompany: jest.fn(),
    findPublicJobById: jest.fn(),
    findPublicJobBySlug: jest.fn(),
    findPublicJobQuestionsBySlug: jest.fn(),
  };

  const mockCompaniesService = {
    findOne: jest.fn(),
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicJobsController],
      providers: [
        { provide: JobsService, useValue: mockJobsService },
        { provide: CompaniesService, useValue: mockCompaniesService },
      ],
    }).compile();

    controller = module.get<PublicJobsController>(PublicJobsController);
    jobsService = module.get<JobsService>(JobsService);
    companiesService = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findPublicJobsByCompany', () => {
    const validCompanySlug = 'test-company';
    const invalidCompanySlug = 'invalid-slug!';

    it('should return jobs for a valid company slug', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          title: 'Desenvolvedor Full Stack',
          description: 'Vaga para desenvolvedor full stack',
          requirements: 'React, Node.js, PostgreSQL',
          expirationDate: null,
          status: 'PUBLISHED',
          departmentId: 'dept-1',
          slug: 'desenvolvedor-full-stack',
          department: {
            id: 'dept-1',
            name: 'Tecnologia',
            description: 'Departamento de tecnologia',
          },
        },
      ];

      mockCompaniesService.findBySlug.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Company',
      });
      mockJobsService.findPublishedJobsByCompany.mockResolvedValue(mockJobs);

      const result = await controller.findPublicJobsByCompany(validCompanySlug);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJobs);
      expect(result.total).toBe(1);
      expect(result.companyId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(companiesService.findBySlug).toHaveBeenCalledWith(
        validCompanySlug,
      );
      expect(jobsService.findPublishedJobsByCompany).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
    });

    it('should throw BadRequestException for invalid slug', async () => {
      await expect(
        controller.findPublicJobsByCompany(invalidCompanySlug),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompaniesService.findBySlug.mockRejectedValue(
        new NotFoundException('Empresa não encontrada'),
      );

      await expect(
        controller.findPublicJobsByCompany(validCompanySlug),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty jobs array when company has no published jobs', async () => {
      mockCompaniesService.findBySlug.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Company',
      });
      mockJobsService.findPublishedJobsByCompany.mockResolvedValue([]);

      const result = await controller.findPublicJobsByCompany(validCompanySlug);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.message).toContain('Nenhuma vaga publicada encontrada');
    });

    it('should return a specific job when valid company slug and job slug are provided', async () => {
      const validJobSlug = 'desenvolvedor-full-stack';
      const mockJob = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Desenvolvedor Full Stack',
        description: 'Vaga para desenvolvedor full stack',
        requirements: 'React, Node.js, PostgreSQL',
        expirationDate: null,
        status: 'PUBLISHED',
        departmentId: 'dept-1',
        slug: validJobSlug,
        publishedAt: new Date(),
        department: {
          id: 'dept-1',
          name: 'Tecnologia',
          description: 'Departamento de tecnologia',
        },
      };

      mockCompaniesService.findBySlug.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Company',
      });
      mockJobsService.findPublicJobBySlug.mockResolvedValue(mockJob);

      const result = await controller.findPublicJobBySlug(
        validCompanySlug,
        validJobSlug,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJob);
      expect(result.companyId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.message).toBe('Vaga encontrada com sucesso');
      expect(companiesService.findBySlug).toHaveBeenCalledWith(
        validCompanySlug,
      );
      expect(jobsService.findPublicJobBySlug).toHaveBeenCalledWith(
        validCompanySlug,
        validJobSlug,
      );
    });

    it('should throw BadRequestException for invalid job slug', async () => {
      await expect(
        controller.findPublicJobBySlug(validCompanySlug, 'invalid-job-slug!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when job does not exist', async () => {
      const validJobSlug = 'desenvolvedor-full-stack';
      mockCompaniesService.findBySlug.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Company',
      });
      mockJobsService.findPublicJobBySlug.mockRejectedValue(
        new NotFoundException('Vaga não encontrada ou não está publicada'),
      );

      await expect(
        controller.findPublicJobBySlug(validCompanySlug, validJobSlug),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPublicJobQuestions', () => {
    const validCompanySlug = 'test-company';
    const validJobSlug = 'desenvolvedor-full-stack';
    const invalidCompanySlug = 'invalid-slug!';
    const invalidJobSlug = 'invalid-job-slug!';

    it('should return questions for a valid job', async () => {
      const mockQuestions = [
        {
          id: 'question-1',
          question: 'Qual é sua experiência com React?',
          orderIndex: 1,
          isRequired: true,
        },
        {
          id: 'question-2',
          question: 'Conte sobre um projeto desafiador que você trabalhou',
          orderIndex: 2,
          isRequired: true,
        },
      ];

      const mockJob = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Desenvolvedor Full Stack',
        slug: validJobSlug,
      };

      mockCompaniesService.findBySlug.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Company',
      });
      mockJobsService.findPublicJobBySlug.mockResolvedValue(mockJob);
      mockJobsService.findPublicJobQuestionsBySlug.mockResolvedValue(
        mockQuestions,
      );

      const result = await controller.findPublicJobQuestions(
        validCompanySlug,
        validJobSlug,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuestions);
      expect(result.total).toBe(2);
      expect(result.jobId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result.message).toBe('Questions da vaga encontradas com sucesso');
      expect(companiesService.findBySlug).toHaveBeenCalledWith(
        validCompanySlug,
      );
      expect(jobsService.findPublicJobBySlug).toHaveBeenCalledWith(
        validCompanySlug,
        validJobSlug,
      );
      expect(jobsService.findPublicJobQuestionsBySlug).toHaveBeenCalledWith(
        validCompanySlug,
        validJobSlug,
      );
    });

    it('should return empty questions array when job has no questions', async () => {
      const mockJob = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Desenvolvedor Full Stack',
        slug: validJobSlug,
      };

      mockCompaniesService.findBySlug.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Company',
      });
      mockJobsService.findPublicJobBySlug.mockResolvedValue(mockJob);
      mockJobsService.findPublicJobQuestionsBySlug.mockResolvedValue([]);

      const result = await controller.findPublicJobQuestions(
        validCompanySlug,
        validJobSlug,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.jobId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result.message).toBe('Nenhuma question encontrada para esta vaga');
    });

    it('should throw BadRequestException for invalid company slug', async () => {
      await expect(
        controller.findPublicJobQuestions(invalidCompanySlug, validJobSlug),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid job slug', async () => {
      await expect(
        controller.findPublicJobQuestions(validCompanySlug, invalidJobSlug),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when job does not exist', async () => {
      mockCompaniesService.findBySlug.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Company',
      });
      mockJobsService.findPublicJobBySlug.mockRejectedValue(
        new NotFoundException('Vaga não encontrada ou não está publicada'),
      );

      await expect(
        controller.findPublicJobQuestions(validCompanySlug, validJobSlug),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
