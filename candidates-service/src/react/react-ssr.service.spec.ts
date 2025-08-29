import { Test, TestingModule } from '@nestjs/testing';
import { ReactSsrService } from './react-ssr.service';

describe('ReactSsrService', () => {
  let service: ReactSsrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReactSsrService],
    }).compile();

    service = module.get<ReactSsrService>(ReactSsrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('render', () => {
    it('should render company jobs page', () => {
      const mockCompanyJobs = {
        success: true,
        data: [],
        total: 0,
        companyId: 'test-company-id',
        message: 'No jobs found'
      };

      const result = service.render('test-company', mockCompanyJobs);
      
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('test-company');
      expect(result).toContain('Gupy Candidates');
    });

    it('should render without company data', () => {
      const result = service.render();
      
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Gupy Candidates');
    });
  });

  describe('renderJob', () => {
    it('should render job detail page with questions modal functionality', () => {
      const mockJobResponse = {
        success: true,
        data: {
          id: 'test-job-id',
          title: 'Test Job',
          description: 'Test job description',
          requirements: 'Test requirements',
          expirationDate: '2024-12-31',
          status: 'PUBLISHED',
          departmentId: 'test-dept-id',
          slug: 'test-job-slug',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          publishedAt: '2024-01-01',
          department: {
            id: 'test-dept-id',
            name: 'Test Department',
            description: 'Test department description'
          }
        },
        companyId: 'test-company-id',
        message: 'Job found successfully'
      };

      const result = service.renderJob('test-company', mockJobResponse);
      
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Test Job');
      expect(result).toContain('test-company');
      expect(result).toContain('test-job-slug');
      
      // Verificar se o modal de perguntas está incluído
      expect(result).toContain('showQuestionsModal');
      expect(result).toContain('fetchQuestions');
      expect(result).toContain('renderQuestions');
      expect(result).toContain('submitResponses');
      expect(result).toContain('Perguntas da Vaga');
    });
  });

  describe('renderJobError', () => {
    it('should render job error page', () => {
      const result = service.renderJobError('test-company', 'test-job', 'Job not found');
      
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Vaga não encontrada');
      expect(result).toContain('test-company');
      expect(result).toContain('test-job');
      expect(result).toContain('Job not found');
    });
  });
});
