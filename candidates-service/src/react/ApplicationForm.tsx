import React, { useState } from 'react';
import { QuestionsModal } from './QuestionsModal';

interface ApplicationFormProps {
  jobId: string;
  companySlug: string;
  jobSlug: string;
  onSuccess: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function ApplicationForm({ jobId, companySlug, jobSlug, onSuccess }: ApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError(null);
    } else if (file) {
      setError('Por favor, selecione apenas arquivos PDF.');
      setResumeFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário submetido via JavaScript');
    setIsSubmitting(true);
    setError(null);

    try {
      let applicationData;
      
      if (resumeFile) {
        // Usar endpoint com upload de resume
        applicationData = await submitWithResume();
      } else {
        // Usar endpoint sem resume
        applicationData = await submitWithoutResume();
      }
      
      // Extrair o ID da application da resposta
      if (applicationData && applicationData.id) {
        setApplicationId(applicationData.id);
        setShowQuestionsModal(true);
      } else {
        // Se não houver perguntas, chamar onSuccess diretamente
        onSuccess();
        // Limpar formulário
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        });
        setResumeFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar inscrição');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitWithResume = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('resume', resumeFile!);

    // Usar URL relativa que será roteada pelo Caddy para o backend
    const response = await fetch(`/jobs/${jobId}/applications/upload-resume`, {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao enviar inscrição com currículo');
    }

    return response.json();
  };

  const submitWithoutResume = async () => {
    // Usar URL relativa que será roteada pelo Caddy para o backend
    const response = await fetch(`/jobs/${jobId}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        jobId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao enviar inscrição');
    }

    return response.json();
  };

  const handleQuestionsSuccess = () => {
    // Limpar formulário
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    setResumeFile(null);
    setShowQuestionsModal(false);
    setApplicationId(null);
    onSuccess();
  };

  const handleQuestionsClose = () => {
    setShowQuestionsModal(false);
    setApplicationId(null);
    // Limpar formulário
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    setResumeFile(null);
    onSuccess();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Candidatar-se para esta Vaga
        </h3>

        <form onSubmit={handleSubmit} method="POST" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu sobrenome"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
              Currículo (PDF) - Opcional
            </label>
            <input
              type="file"
              id="resume"
              name="resume"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Aceitamos apenas arquivos PDF. Tamanho máximo: 10MB.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Candidatura'}
          </button>
        </form>
      </div>

      {/* Modal de Perguntas */}
      {showQuestionsModal && applicationId && (
        <QuestionsModal
          isOpen={showQuestionsModal}
          onClose={handleQuestionsClose}
          jobId={jobId}
          applicationId={applicationId}
          companySlug={companySlug}
          jobSlug={jobSlug}
          onSuccess={handleQuestionsSuccess}
        />
      )}
    </>
  );
}
