import { Test, TestingModule } from '@nestjs/testing';
import { S3ClientService } from './s3-client.service';
import * as AWS from 'aws-sdk';

// Mock do AWS SDK
jest.mock('aws-sdk');

describe('S3ClientService', () => {
  let service: S3ClientService;
  let mockS3: jest.Mocked<AWS.S3>;

  beforeEach(async () => {
    // Configurar variáveis de ambiente para teste
    process.env.ENDPOINT_URL = 'http://localhost:9000';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [S3ClientService],
    }).compile();

    service = module.get<S3ClientService>(S3ClientService);

    // Mock do S3
    mockS3 = {
      upload: jest.fn().mockReturnValue({
        promise: jest
          .fn()
          .mockResolvedValue({
            Location: 'http://localhost:9000/test-bucket/test-file.pdf',
          }),
      }),
      headBucket: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      }),
      createBucket: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      }),
      getSignedUrlPromise: jest
        .fn()
        .mockResolvedValue('http://localhost:9000/presigned-url'),
      deleteObject: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      }),
    } as any;

    // Substituir a instância do S3 no serviço
    (service as any).s3 = mockS3;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file successfully when bucket exists', async () => {
      // Mock do fs.existsSync
      jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
      jest
        .spyOn(require('fs'), 'readFileSync')
        .mockReturnValue(Buffer.from('test content'));

      const result = await service.uploadFile('/test/file.pdf', 'test-bucket');

      expect(mockS3.headBucket).toHaveBeenCalledWith({ Bucket: 'test-bucket' });
      expect(mockS3.upload).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'file.pdf',
        Body: Buffer.from('test content'),
        ContentType: 'application/pdf',
      });
      expect(result).toBe('http://localhost:9000/test-bucket/test-file.pdf');
    });

    it('should create bucket and upload file when bucket does not exist', async () => {
      // Mock do fs.existsSync
      jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
      jest
        .spyOn(require('fs'), 'readFileSync')
        .mockReturnValue(Buffer.from('test content'));

      // Mock do headBucket para retornar erro 404 (bucket não existe)
      mockS3.headBucket.mockReturnValue({
        promise: jest.fn().mockRejectedValue({ statusCode: 404 }),
        abort: jest.fn(),
        createReadStream: jest.fn(),
        eachPage: jest.fn(),
        isPageable: jest.fn(),
        send: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        emit: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
        setMaxListeners: jest.fn(),
        getMaxListeners: jest.fn(),
        listeners: jest.fn(),
        rawListeners: jest.fn(),
        listenerCount: jest.fn(),
        prependListener: jest.fn(),
        prependOnceListener: jest.fn(),
        eventNames: jest.fn(),
      } as any);

      const result = await service.uploadFile('/test/file.pdf', 'new-bucket');

      expect(mockS3.createBucket).toHaveBeenCalledWith({
        Bucket: 'new-bucket',
      });
      expect(mockS3.upload).toHaveBeenCalled();
      expect(result).toBe('http://localhost:9000/test-bucket/test-file.pdf');
    });

    it('should throw error when file does not exist', async () => {
      jest.spyOn(require('fs'), 'existsSync').mockReturnValue(false);

      await expect(
        service.uploadFile('/nonexistent/file.pdf', 'test-bucket'),
      ).rejects.toThrow('Arquivo não encontrado: /nonexistent/file.pdf');
    });
  });

  describe('getPresignedUrl', () => {
    it('should generate presigned URL successfully', async () => {
      const result = await service.getPresignedUrl(
        'test-bucket',
        'test-file.pdf',
        3600,
      );

      expect(mockS3.getSignedUrlPromise).toHaveBeenCalledWith('getObject', {
        Bucket: 'test-bucket',
        Key: 'test-file.pdf',
        Expires: 3600,
      });
      expect(result).toBe('http://localhost:9000/presigned-url');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      await service.deleteFile('test-bucket', 'test-file.pdf');

      expect(mockS3.deleteObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test-file.pdf',
      });
    });
  });

  describe('getContentType', () => {
    it('should return correct content type for PDF files', () => {
      const result = (service as any).getContentType('/test/file.pdf');
      expect(result).toBe('application/pdf');
    });

    it('should return correct content type for image files', () => {
      const result = (service as any).getContentType('/test/image.jpg');
      expect(result).toBe('image/jpeg');
    });

    it('should return default content type for unknown files', () => {
      const result = (service as any).getContentType('/test/file.unknown');
      expect(result).toBe('application/octet-stream');
    });
  });
});
