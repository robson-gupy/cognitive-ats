import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from '../src/jobs/jobs.service';
import { Job, JobStatus } from '../src/jobs/entities/job.entity';
import { JobQuestion } from '../src/jobs/entities/job-question.entity';
import { JobStage } from '../src/jobs/entities/job-stage.entity';
import { JobLog } from '../src/jobs/entities/job-log.entity';
import { Application } from '../src/jobs/entities/application.entity';
import { ApplicationStageHistory } from '../src/jobs/entities/application-stage-history.entity';
import { User } from '../src/users/entities/user.entity';
import { Company } from '../src/companies/entities/company.entity';
import { Department } from '../src/departments/entities/department.entity';
import { AiServiceClient } from '../src/jobs/ai-service.client';
import { BadRequestException } from '@nestjs/common';

describe('JobsService Integration', () => {
  let module: TestingModule;
  let jobsService: JobsService;
  let jobRepository: Repository<Job>;
  let jobStageRepository: Repository<JobStage>;
  let jobQuestionRepository: Repository<JobQuestion>;
  let applicationRepository: Repository<Application>;
  let applicationStageHistoryRepository: Repository<ApplicationStageHistory>;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let departmentRepository: Repository<Department>;

  let testUser: User;
  let testCompany: Company;
  let testDepartment: Department;
  let testJob: Job;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'cognitive_ats_test',
          entities: [Job, JobStage, JobQuestion, JobLog, Application, ApplicationStageHistory, User, Company, Department],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          Job, JobStage, JobQuestion, JobLog, Application, ApplicationStageHistory, User, Company, Department
        ]),
      ],
      providers: [
        JobsService,
        {
          provide: AiServiceClient,
          useValue: {
            createJob: jest.fn(),
          },
        },
      ],
    }).compile();

    jobsService = module.get<JobsService>(JobsService);
    jobRepository = module.get<Repository<Job>>('JobRepository');
    jobStageRepository = module.get<Repository<JobStage>>('JobStageRepository');
    jobQuestionRepository = module.get<Repository<JobQuestion>>('JobQuestionRepository');
    applicationRepository = module.get<Repository<Application>>('ApplicationRepository');
    applicationStageHistoryRepository = module.get<Repository<ApplicationStageHistory>>('ApplicationStageHistoryRepository');
    userRepository = module.get<Repository<User>>('UserRepository');
    companyRepository = module.get<Repository<Company>>('CompanyRepository');
    departmentRepository = module.get<Repository<Department>>('DepartmentRepository');
  });

  beforeEach(async () => {
    // Clean up database
    await applicationStageHistoryRepository.clear();
    await applicationRepository.clear();
    await jobQuestionRepository.clear();
    await jobStageRepository.clear();
    await jobRepository.clear();
    await userRepository.clear();
    await departmentRepository.clear();
    await companyRepository.clear();

    // Create test data
    testCompany = await companyRepository.save({
      name: 'Test Company',
      description: 'Test Company Description',
      code: 'TEST',
      isActive: true,
    });

    testDepartment = await departmentRepository.save({
      name: 'Test Department',
      description: 'Test Department Description',
      code: 'TEST_DEPT',
      isActive: true,
      companyId: testCompany.id,
    });

    testUser = await userRepository.save({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword',
      companyId: testCompany.id,
      isActive: true,
    });

    testJob = await jobRepository.save({
      title: 'Test Job',
      description: 'Test Job Description',
      requirements: 'Test Requirements',
      status: JobStatus.DRAFT,
      companyId: testCompany.id,
      departmentId: testDepartment.id,
      createdBy: testUser.id,
    });
  });

  afterAll(async () => {
    await module.close();
  });

  describe('updateStages', () => {
    it('should create stages when job has no stages', async () => {
      // Arrange
      const newStages = [
        { name: 'Triagem', description: 'Avaliação inicial', orderIndex: 0, isActive: true },
        { name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 1, isActive: true },
        { name: 'Contratação', description: 'Processo final', orderIndex: 2, isActive: true },
      ];

      // Act
      await jobsService.updateStages(testJob.id, newStages, testUser.id);

      // Assert
      const savedStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      expect(savedStages).toHaveLength(3);
      expect(savedStages[0].name).toBe('Triagem');
      expect(savedStages[1].name).toBe('Entrevista');
      expect(savedStages[2].name).toBe('Contratação');
    });

    it('should update existing stages without creating duplicates', async () => {
      // Arrange - Create initial stages
      const initialStages = [
        { name: 'Triagem', description: 'Avaliação inicial', orderIndex: 0, isActive: true },
        { name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 1, isActive: true },
      ];

      await jobsService.updateStages(testJob.id, initialStages, testUser.id);

      // Get created stages
      const createdStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      // Act - Update stages
      const updatedStages = [
        { id: createdStages[0].id, name: 'Triagem Atualizada', description: 'Nova descrição', orderIndex: 0, isActive: true },
        { id: createdStages[1].id, name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 1, isActive: true },
      ];

      await jobsService.updateStages(testJob.id, updatedStages, testUser.id);

      // Assert
      const finalStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      expect(finalStages).toHaveLength(2);
      expect(finalStages[0].name).toBe('Triagem Atualizada');
      expect(finalStages[1].name).toBe('Entrevista');
    });

    it('should delete stages that are no longer present', async () => {
      // Arrange - Create initial stages
      const initialStages = [
        { name: 'Triagem', description: 'Avaliação inicial', orderIndex: 0, isActive: true },
        { name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 1, isActive: true },
        { name: 'Contratação', description: 'Processo final', orderIndex: 2, isActive: true },
      ];

      await jobsService.updateStages(testJob.id, initialStages, testUser.id);

      // Get created stages
      const createdStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      // Act - Remove one stage
      const updatedStages = [
        { id: createdStages[0].id, name: 'Triagem', description: 'Avaliação inicial', orderIndex: 0, isActive: true },
        { id: createdStages[2].id, name: 'Contratação', description: 'Processo final', orderIndex: 1, isActive: true },
      ];

      await jobsService.updateStages(testJob.id, updatedStages, testUser.id);

      // Assert
      const finalStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      expect(finalStages).toHaveLength(2);
      expect(finalStages[0].name).toBe('Triagem');
      expect(finalStages[1].name).toBe('Contratação');
    });

    it('should not delete stages if there are active applications', async () => {
      // Arrange - Create stages and application
      const initialStages = [
        { name: 'Triagem', description: 'Avaliação inicial', orderIndex: 0, isActive: true },
        { name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 1, isActive: true },
      ];

      await jobsService.updateStages(testJob.id, initialStages, testUser.id);

      const createdStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      // Create application in the first stage
      await applicationRepository.save({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        jobId: testJob.id,
        currentStageId: createdStages[0].id,
        companyId: testCompany.id,
      });

      // Act & Assert - Try to delete stage with active application
      const updatedStages = [
        { id: createdStages[1].id, name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 0, isActive: true },
      ];

      await expect(jobsService.updateStages(testJob.id, updatedStages, testUser.id)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should delete stage history when deleting stages', async () => {
      // Arrange - Create stages and history
      const initialStages = [
        { name: 'Triagem', description: 'Avaliação inicial', orderIndex: 0, isActive: true },
        { name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 1, isActive: true },
      ];

      await jobsService.updateStages(testJob.id, initialStages, testUser.id);

      const createdStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      // Create stage history
      await applicationStageHistoryRepository.save({
        applicationId: 'app-1',
        jobId: testJob.id,
        companyId: testCompany.id,
        fromStageId: createdStages[0].id,
        toStageId: createdStages[1].id,
        changedById: testUser.id,
        notes: 'Test movement',
      });

      // Act - Delete the first stage
      const updatedStages = [
        { id: createdStages[1].id, name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 0, isActive: true },
      ];

      await jobsService.updateStages(testJob.id, updatedStages, testUser.id);

      // Assert
      const finalStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      const remainingHistory = await applicationStageHistoryRepository.find();

      expect(finalStages).toHaveLength(1);
      expect(finalStages[0].name).toBe('Entrevista');
      expect(remainingHistory).toHaveLength(0); // History should be deleted
    });
  });

  describe('update', () => {
    it('should update job without modifying stages when stages are not provided', async () => {
      // Arrange
      const updateData = {
        title: 'Updated Job Title',
        description: 'Updated Description',
      };

      // Act
      const updatedJob = await jobsService.update(testJob.id, updateData, testUser);

      // Assert
      expect(updatedJob.title).toBe('Updated Job Title');
      expect(updatedJob.description).toBe('Updated Description');
    });

    it('should update stages when stages are provided', async () => {
      // Arrange
      const updateData = {
        title: 'Updated Job Title',
        stages: [
          { name: 'Triagem', description: 'Avaliação inicial', orderIndex: 0, isActive: true },
          { name: 'Entrevista', description: 'Entrevista com candidatos', orderIndex: 1, isActive: true },
        ],
      };

      // Act
      await jobsService.update(testJob.id, updateData, testUser);

      // Assert
      const savedStages = await jobStageRepository.find({
        where: { jobId: testJob.id },
        order: { orderIndex: 'ASC' },
      });

      expect(savedStages).toHaveLength(2);
      expect(savedStages[0].name).toBe('Triagem');
      expect(savedStages[1].name).toBe('Entrevista');
    });
  });

  describe('publish', () => {
    it('should publish a draft job', async () => {
      // Arrange
      const draftJob = await jobRepository.save({
        title: 'Draft Job',
        description: 'Draft Description',
        requirements: 'Draft Requirements',
        status: JobStatus.DRAFT,
        companyId: testCompany.id,
        departmentId: testDepartment.id,
        createdBy: testUser.id,
      });

      // Act
      const publishedJob = await jobsService.publish(draftJob.id, testUser);

      // Assert
      expect(publishedJob.status).toBe(JobStatus.PUBLISHED);
      expect(publishedJob.publishedAt).toBeDefined();
    });

    it('should throw error when trying to publish non-draft job', async () => {
      // Arrange
      const publishedJob = await jobRepository.save({
        title: 'Published Job',
        description: 'Published Description',
        requirements: 'Published Requirements',
        status: JobStatus.PUBLISHED,
        companyId: testCompany.id,
        departmentId: testDepartment.id,
        createdBy: testUser.id,
      });

      // Act & Assert
      await expect(jobsService.publish(publishedJob.id, testUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('close', () => {
    it('should close a published job', async () => {
      // Arrange
      const publishedJob = await jobRepository.save({
        title: 'Published Job',
        description: 'Published Description',
        requirements: 'Published Requirements',
        status: JobStatus.PUBLISHED,
        companyId: testCompany.id,
        departmentId: testDepartment.id,
        createdBy: testUser.id,
      });

      // Act
      const closedJob = await jobsService.close(publishedJob.id, testUser);

      // Assert
      expect(closedJob.status).toBe(JobStatus.CLOSED);
      expect(closedJob.closedAt).toBeDefined();
    });
  });
});
