import { Test, TestingModule } from '@nestjs/testing';
import { PublicJobsController } from './public-jobs.controller';
import { JobsService } from './jobs.service';
import { CompaniesService } from '../companies/companies.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PublicJobsController', () => {
  let controller: PublicJobsController;
  let jobsService: JobsService;
  let companiesService: CompaniesService;

  const mockJobsService = {
    findPublishedJobsByCompany: jest.fn(),
    findPublicJobById: jest.fn(),
  };

  const mockCompaniesService = {
    findOne: jest.fn(),
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
    const validCompanyId = '123e4567-e89b-12d3-a456-426614174000';
    const invalidCompanyId = 'invalid-uuid';

    it('should return jobs for a valid company ID', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          title: 'Desenvolvedor Full Stack',
          description: 'Vaga para desenvolvedor full stack',
          requirements: 'React, Node.js, PostgreSQL',
          expirationDate: null,
          status: 'PUBLISHED',
          departmentId: 'dept-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          department: {
            id: 'dept-1',
            name: 'Tecnologia',
            description: 'Departamento de tecnologia'
          }
        }
      ];

      mockCompaniesService.findOne.mockResolvedValue({ id: validCompanyId, name: 'Test Company' });
      mockJobsService.findPublishedJobsByCompany.mockResolvedValue(mockJobs);

      const result = await controller.findPublicJobsByCompany(validCompanyId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJobs);
      expect(result.total).toBe(1);
      expect(result.companyId).toBe(validCompanyId);
      expect(companiesService.findOne).toHaveBeenCalledWith(validCompanyId);
      expect(jobsService.findPublishedJobsByCompany).toHaveBeenCalledWith(validCompanyId);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      await expect(controller.findPublicJobsByCompany(invalidCompanyId))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompaniesService.findOne.mockRejectedValue(new NotFoundException('Empresa não encontrada'));

      await expect(controller.findPublicJobsByCompany(validCompanyId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should return empty jobs array when company has no published jobs', async () => {
      mockCompaniesService.findOne.mockResolvedValue({ id: validCompanyId, name: 'Test Company' });
      mockJobsService.findPublishedJobsByCompany.mockResolvedValue([]);

      const result = await controller.findPublicJobsByCompany(validCompanyId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.message).toContain('Nenhuma vaga publicada encontrada');
    });

    it('should return a specific job when valid company and job IDs are provided', async () => {
      const validJobId = '123e4567-e89b-12d3-a456-426614174001';
      const mockJob = {
        id: validJobId,
        title: 'Desenvolvedor Full Stack',
        description: 'Vaga para desenvolvedor full stack',
        requirements: 'React, Node.js, PostgreSQL',
        expirationDate: null,
        status: 'PUBLISHED',
        departmentId: 'dept-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        department: {
          id: 'dept-1',
          name: 'Tecnologia',
          description: 'Departamento de tecnologia'
        }
      };

      mockCompaniesService.findOne.mockResolvedValue({ id: validCompanyId, name: 'Test Company' });
      mockJobsService.findPublicJobById.mockResolvedValue(mockJob);

      const result = await controller.findPublicJobById(validCompanyId, validJobId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJob);
      expect(result.companyId).toBe(validCompanyId);
      expect(result.message).toBe('Vaga encontrada com sucesso');
      expect(companiesService.findOne).toHaveBeenCalledWith(validCompanyId);
      expect(jobsService.findPublicJobById).toHaveBeenCalledWith(validCompanyId, validJobId);
    });

    it('should throw BadRequestException for invalid job UUID', async () => {
      await expect(controller.findPublicJobById(validCompanyId, 'invalid-job-id'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw NotFoundException when job does not exist', async () => {
      const validJobId = '123e4567-e89b-12d3-a456-426614174001';
      mockCompaniesService.findOne.mockResolvedValue({ id: validCompanyId, name: 'Test Company' });
      mockJobsService.findPublicJobById.mockRejectedValue(new NotFoundException('Vaga não encontrada ou não está publicada'));

      await expect(controller.findPublicJobById(validCompanyId, validJobId))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
