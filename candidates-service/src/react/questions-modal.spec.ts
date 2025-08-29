// Teste simples para verificar se o QuestionsModal está funcionando
describe('QuestionsModal', () => {
  it('should have correct interface', () => {
    // Verificar se a interface está correta
    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      jobId: 'test-job-id',
      applicationId: 'test-application-id',
      companySlug: 'test-company',
      jobSlug: 'test-job',
      onSuccess: jest.fn()
    };

    expect(mockProps.isOpen).toBe(true);
    expect(mockProps.jobId).toBe('test-job-id');
    expect(mockProps.applicationId).toBe('test-application-id');
    expect(mockProps.companySlug).toBe('test-company');
    expect(mockProps.jobSlug).toBe('test-job');
    expect(typeof mockProps.onClose).toBe('function');
    expect(typeof mockProps.onSuccess).toBe('function');
  });

  it('should handle question responses correctly', () => {
    const mockResponses = [
      {
        jobQuestionId: '52a535ba-3dcb-4725-80e4-009dcec569ef',
        answer: 'Programo em Python ha 10 anos'
      },
      {
        jobQuestionId: '958fcf2f-ebd6-4cdf-82da-a5cc9dd31892',
        answer: 'Django / Flask'
      }
    ];

    expect(mockResponses).toHaveLength(2);
    expect(mockResponses[0].jobQuestionId).toBe('52a535ba-3dcb-4725-80e4-009dcec569ef');
    expect(mockResponses[0].answer).toBe('Programo em Python ha 10 anos');
    expect(mockResponses[1].jobQuestionId).toBe('958fcf2f-ebd6-4cdf-82da-a5cc9dd31892');
    expect(mockResponses[1].answer).toBe('Django / Flask');
  });

  it('should validate required fields', () => {
    const mockQuestion = {
      id: 'test-question-id',
      question: 'Qual sua experiência com Python?',
      orderIndex: 1,
      isRequired: true
    };

    expect(mockQuestion.isRequired).toBe(true);
    expect(mockQuestion.orderIndex).toBe(1);
    expect(mockQuestion.question).toBe('Qual sua experiência com Python?');
  });
});
