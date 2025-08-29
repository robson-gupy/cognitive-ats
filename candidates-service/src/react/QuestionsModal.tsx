import React, { useState, useEffect } from 'react';

interface JobQuestion {
  id: string;
  question: string;
  orderIndex: number;
  isRequired: boolean;
}

interface QuestionResponse {
  jobQuestionId: string;
  answer: string;
}

interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  applicationId: string;
  companySlug: string;
  jobSlug: string;
  onSuccess: () => void;
}

export function QuestionsModal({
  isOpen,
  onClose,
  jobId,
  applicationId,
  companySlug,
  jobSlug,
  onSuccess
}: QuestionsModalProps) {
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Buscar perguntas da vaga
  useEffect(() => {
    if (isOpen && companySlug && jobSlug) {
      fetchQuestions();
    }
  }, [isOpen, companySlug, jobSlug]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/public/${companySlug}/jobs/${jobSlug}/questions`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar perguntas da vaga');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Ordenar perguntas por orderIndex
        const sortedQuestions = data.data.sort((a: JobQuestion, b: JobQuestion) => a.orderIndex - b.orderIndex);
        setQuestions(sortedQuestions);
        
        // Inicializar respostas vazias
        const initialResponses = sortedQuestions.map(q => ({
          jobQuestionId: q.id,
          answer: ''
        }));
        setResponses(initialResponses);
      } else {
        throw new Error(data.message || 'Erro ao buscar perguntas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar perguntas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (answer: string) => {
    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex].answer = answer;
    setResponses(updatedResponses);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const canGoNext = () => {
    const currentResponse = responses[currentQuestionIndex];
    return currentResponse && currentResponse.answer.trim() !== '';
  };

  const canGoPrevious = () => {
    return currentQuestionIndex > 0;
  };

  const isLastQuestion = () => {
    return currentQuestionIndex === questions.length - 1;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/jobs/${jobId}/applications/${applicationId}/question-responses/multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: responses.filter(r => r.answer.trim() !== '')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao enviar respostas');
      }

      setIsCompleted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar respostas');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sucesso!</h3>
          <p className="text-gray-600 mb-4">
            Todas as suas respostas foram enviadas com sucesso. Sua candidatura está completa!
          </p>
          <p className="text-sm text-gray-500">
            Redirecionando em alguns segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Perguntas da Vaga
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Pergunta {currentQuestionIndex + 1} de {questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando perguntas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchQuestions}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : questions.length > 0 ? (
            <div>
              {/* Question */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {questions[currentQuestionIndex].question}
                </h4>
                
                {questions[currentQuestionIndex].isRequired && (
                  <p className="text-sm text-red-600 mb-4">* Esta pergunta é obrigatória</p>
                )}
                
                <textarea
                  value={responses[currentQuestionIndex]?.answer || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  required={questions[currentQuestionIndex].isRequired}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma pergunta encontrada para esta vaga.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious()}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <div className="flex space-x-3">
              {!isLastQuestion() ? (
                <button
                  onClick={goToNext}
                  disabled={!canGoNext()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canGoNext() || isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Concluir'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
