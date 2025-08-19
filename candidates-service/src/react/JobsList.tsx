import React, { useState, useMemo } from 'react';
import { Job } from '../app.service';

interface JobsListProps {
  jobs: Job[];
  companyName: string;
  companySlug: string;
}

export function JobsList({ jobs, companyName, companySlug }: JobsListProps) {
  const [titleFilter, setTitleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Obter departamentos únicos para o filtro
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    jobs.forEach(job => {
      if (job.department?.name) {
        deptSet.add(job.department.name);
      }
    });
    return Array.from(deptSet).sort();
  }, [jobs]);

  // Filtrar vagas baseado nos filtros
  const filteredJobs = useMemo(() => {
    if (!titleFilter && !departmentFilter) {
      return jobs;
    }

    return jobs.filter(job => {
      // Filtro por título (case-insensitive)
      const matchesTitle = !titleFilter || 
        job.title.toLowerCase().includes(titleFilter.toLowerCase().trim());
      
      // Filtro por departamento
      const matchesDepartment = !departmentFilter || 
        (job.department?.name && job.department.name === departmentFilter);
      
      return matchesTitle && matchesDepartment;
    });
  }, [jobs, titleFilter, departmentFilter]);

  // Limpar filtros
  const clearFilters = () => {
    setTitleFilter('');
    setDepartmentFilter('');
  };

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar descrição
  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
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
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                Entrar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="title-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por título
              </label>
              <input
                type="text"
                id="title-filter"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Digite o título da vaga..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por departamento
              </label>
              <select
                id="department-filter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todos os departamentos</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <button
                id="clear-filters"
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
          
          {/* Contador de resultados */}
          <div id="results-counter" className="mt-4 text-sm text-gray-600">
            Mostrando {filteredJobs.length} de {jobs.length} vagas
            {(titleFilter || departmentFilter) && (
              <span className="ml-2 text-indigo-600">
                (filtrado)
              </span>
            )}
          </div>
          

        </div>
      </section>

      {/* Lista de Vagas */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {jobs.length === 0 ? 'Nenhuma vaga disponível' : 'Nenhuma vaga encontrada'}
              </h3>
              <p className="text-gray-600">
                {jobs.length === 0 
                  ? 'Esta empresa ainda não possui vagas publicadas.'
                  : 'Tente ajustar os filtros para encontrar mais vagas.'
                }
              </p>
              {(titleFilter || departmentFilter) && (
                <div className="mt-4 text-sm text-gray-500">
                  <p>Filtros ativos:</p>
                  {titleFilter && <p>• Título: "{titleFilter}"</p>}
                  {departmentFilter && <p>• Departamento: "{departmentFilter}"</p>}
                </div>
              )}
            </div>
          ) : (
            <div id="jobs-list" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    
                    {job.department && (
                      <div className="mb-2">
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                          {job.department.name}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 mb-2">
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Publicada em: {formatDate(job.publishedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {truncateDescription(job.description)}
                  </p>
                  
                  {job.requirements && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Requisitos:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {truncateDescription(job.requirements, 100)}
                      </p>
                    </div>
                  )}
                  
                  {job.expirationDate && (
                    <div className="mb-4 text-sm text-gray-600">
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Expira em: {formatDate(job.expirationDate)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <a 
                      href={`http://${companySlug}.jobs.localhost/${job.slug}`}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors text-center"
                    >
                      Ver Mais Informações
                    </a>
                    <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                      Candidatar-se
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
