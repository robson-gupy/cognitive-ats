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
            <button className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <section className="border-b border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="title-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por título
              </label>
              <input
                type="text"
                id="title-filter"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Digite o título da vaga..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-0"
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <select
                id="department-filter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-0"
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
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Limpar
              </button>
            </div>
          </div>
          
          {/* Contador de resultados */}
          <div id="results-counter" className="mt-6 text-sm text-gray-500">
            {filteredJobs.length} de {jobs.length} vagas
            {(titleFilter || departmentFilter) && (
              <span className="ml-2 text-gray-700">
                (filtrado)
              </span>
            )}
          </div>
        </div>
      </section>
      {/* Lista de Vagas */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
            </div>
          ) : (
            <div id="jobs-list" className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="border border-gray-100 rounded-lg p-6 hover:border-gray-200 transition-colors">
                  {/* Card simplificado: apenas título, data e botão */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{job.title}</h3>
                      <div className="text-sm text-gray-500">
                        <span className="inline-flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Publicada em {formatDate(job.publishedAt)}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`http://${companySlug}.jobs.localhost/${job.slug}`}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Ver Mais
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2024 {companyName} - Plataforma de Recrutamento
          </p>
        </div>
      </footer>
    </div>
  );
}
