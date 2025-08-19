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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{companyName.charAt(0)}</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">{companyName} - Vagas</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href={`http://${companySlug}.jobs.localhost/`}
                className="text-indigo-600 hover:text-indigo-700 px-3 py-2 text-sm font-medium transition-colors"
              >
                ← Voltar às Vagas
              </a>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                Entrar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Job Details */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                
                {job.department && (
                  <div className="mb-4">
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
                      {job.department.name}
                    </span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Publicada em: {formatDate(job.publishedAt)}</span>
                  </div>
                  
                  {job.expirationDate && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Expira em: {formatDate(job.expirationDate)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Status: {job.status === 'PUBLISHED' ? 'Ativa' : job.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Apply Button */}
            <div className="border-t border-gray-200 pt-6">
              <button 
                id="apply-button"
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Candidatar-se para esta Vaga
              </button>
            </div>
          </div>

          {/* Job Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Descrição da Vaga</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {formatDescription(job.description)}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Requisitos</h2>
                  <div className="prose prose-gray max-w-none">
                    <div className="text-gray-700 leading-relaxed">
                      {formatRequirements(job.requirements)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre a Empresa</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-xl">{companyName.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{companyName}</h4>
                    <p className="text-sm text-gray-600">Empresa parceira</p>
                  </div>
                </div>
                <a 
                  href={`http://${companySlug}.jobs.localhost/`}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                >
                  Ver todas as vagas →
                </a>
              </div>

              {/* Job Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Vaga</h3>
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

              {/* Quick Apply */}
              <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">Candidatura Rápida</h3>
                <p className="text-indigo-700 text-sm mb-4">
                  Clique no botão abaixo para se candidatar a esta vaga.
                </p>
                <button 
                  id="quick-apply-button"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Candidatar-se Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 {companyName} - Plataforma de Recrutamento Inteligente
          </p>
        </div>
      </footer>
    </div>
  );
}
