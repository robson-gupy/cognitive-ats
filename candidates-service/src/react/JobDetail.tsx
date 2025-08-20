import React from 'react';
import { Job } from '../app.service';

interface JobDetailProps {
  job: Job;
  companyName: string;
  companySlug: string;
}

export function JobDetail({ job, companyName, companySlug }: JobDetailProps) {
  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar descrição com quebras de linha
  const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Formatar requisitos com quebras de linha
  const formatRequirements = (requirements: string) => {
    return requirements.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-light text-lg">{companyName.charAt(0)}</span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-light text-gray-900">{companyName}</h1>
                <p className="text-gray-500 text-sm">Vagas disponíveis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href={`http://${companySlug}.jobs.localhost/`}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                ← Voltar às Vagas
              </a>
              <button className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Entrar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Job Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Job Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-medium text-gray-900 mb-4">{job.title}</h1>

            {job.department && (
              <div className="mb-4">
                <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                  {job.department.name}
                </span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Publicada em {formatDate(job.publishedAt)}</span>
              </div>
              
              {job.expirationDate && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Expira em {formatDate(job.expirationDate)}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Status: {job.status === 'PUBLISHED' ? 'Ativa' : job.status}</span>
              </div>
            </div>
          </div>

          {/* Job Content - Layout em duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna principal com detalhes da vaga */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4">Descrição da Vaga</h2>
                <div className="text-gray-700 leading-relaxed">
                  {formatDescription(job.description)}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Requisitos</h2>
                  <div className="text-gray-700 leading-relaxed">
                    {formatRequirements(job.requirements)}
                  </div>
                </div>
              )}

              {/* Company Info */}
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4">Sobre a Empresa</h2>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-light text-xl">{companyName.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{companyName}</h4>
                    <p className="text-sm text-gray-600">Empresa parceira</p>
                  </div>
                </div>
                <a 
                  href={`http://${companySlug}.jobs.localhost/`}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  Ver todas as vagas →
                </a>
              </div>

              {/* Job Summary */}
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4">Resumo da Vaga</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departamento:</span>
                    <span className="font-medium text-gray-900">
                      {job.department ? job.department.name : 'Não especificado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data de Publicação:</span>
                    <span className="font-medium text-gray-900">{formatDate(job.publishedAt)}</span>
                  </div>
                  {job.expirationDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Expiração:</span>
                      <span className="font-medium text-gray-900">{formatDate(job.expirationDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-gray-900">
                      {job.status === 'PUBLISHED' ? 'Ativa' : job.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna lateral direita com formulário de inscrição */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="application-form-container">
                  {/* O formulário será inserido aqui via JavaScript */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Candidatar-se para esta Vaga
                    </h3>
                    <p className="text-gray-500">Carregando formulário...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2024 {companyName} - Plataforma de Recrutamento
          </p>
        </div>
      </footer>

    </div>
  );
}
