import { Test, TestingModule } from '@nestjs/testing';
import { SqsClientService } from './sqs-client.service';

describe('SqsClientService', () => {
  let service: SqsClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SqsClientService],
    }).compile();

    service = module.get<SqsClientService>(SqsClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendApplicationCreatedMessage', () => {
    it('should send application created message to SQS', async () => {
      const applicationId = 'test-application-id';
      const resumeUrl = '/resumes/resume.pdf';

      // Mock do método sendMessage
      const sendMessageSpy = jest
        .spyOn(service as any, 'sendMessage')
        .mockResolvedValue(undefined);

      await service.sendApplicationCreatedMessage(applicationId, resumeUrl);

      expect(sendMessageSpy).toHaveBeenCalledWith(
        'applications-queue', // valor padrão
        {
          applicationId,
          resumeUrl,
          eventType: 'APPLICATION_CREATED',
          timestamp: expect.any(String),
        },
      );
    });
  });
});
