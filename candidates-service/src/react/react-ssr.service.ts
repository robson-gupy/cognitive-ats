// src/react/react-ssr.service.ts
import { Injectable } from '@nestjs/common';
import { renderToString } from 'react-dom/server';
import { App } from './app.component';
import { JobDetail } from './JobDetail';
import React from 'react';
import { CompanyJobsResponse, JobResponse } from '../app.service';

@Injectable()
export class ReactSsrService {
    render(slug?: string, companyJobs?: CompanyJobsResponse): string {
        const content = renderToString(React.createElement(App, { slug, companyJobs }));
        return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${slug ? `${slug.charAt(0).toUpperCase() + slug.slice(1)} - ` : ''}Gupy Candidates - Encontre as Melhores Oportunidades</title>
          <meta name="description" content="Conectamos candidatos talentosos com empresas inovadoras através de inteligência artificial." />
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    indigo: {
                      50: '#eef2ff',
                      100: '#e0e7ff',
                      600: '#4f46e5',
                      700: '#4338ca',
                    }
                  }
                }
              }
            }
          </script>
        </head>
        <body>
          <div id="root">${content}</div>
          <script>
            // Dados das vagas para filtragem no cliente
            window.COMPANY_DATA = {
              slug: ${JSON.stringify(slug || null)},
              jobs: ${JSON.stringify(companyJobs || null)}
            };
            
            // Filtros no frontend usando JavaScript puro
            document.addEventListener('DOMContentLoaded', function() {
              if (!window.COMPANY_DATA || !window.COMPANY_DATA.jobs || !window.COMPANY_DATA.jobs.success) {
                return;
              }
              
              const allJobs = window.COMPANY_DATA.jobs.data;
              let titleFilter = '';
              let departmentFilter = '';
              
              // Elementos do DOM
              const titleInput = document.querySelector('#title-filter');
              const departmentSelect = document.querySelector('#department-filter');
              const clearButton = document.querySelector('#clear-filters');
              const resultsCounter = document.querySelector('#results-counter');
              const jobsList = document.querySelector('#jobs-list');
              
              // Função para formatar data
              function formatDate(dateString) {
                if (!dateString) return 'Não definida';
                const date = new Date(dateString);
                return date.toLocaleDateString('pt-BR');
              }
              
              // Função para truncar texto
              function truncateText(text, maxLength) {
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength) + '...';
              }
              
              // Função para filtrar vagas
              function filterJobs() {
                let filteredJobs = allJobs;
                
                if (titleFilter || departmentFilter) {
                  filteredJobs = allJobs.filter(job => {
                    const matchesTitle = !titleFilter || 
                      job.title.toLowerCase().includes(titleFilter.toLowerCase().trim());
                    
                    const matchesDepartment = !departmentFilter || 
                      (job.department && job.department.name === departmentFilter);
                    
                    return matchesTitle && matchesDepartment;
                  });
                }
                
                return filteredJobs;
              }
              
              // Função para atualizar a interface
              function updateUI() {
                const filteredJobs = filterJobs();
                
                // Atualizar contador
                if (resultsCounter) {
                  const filterText = (titleFilter || departmentFilter) ? ' (filtrado)' : '';
                  resultsCounter.innerHTML = \`Mostrando \${filteredJobs.length} de \${allJobs.length} vagas\${filterText ? '<span class="ml-2 text-indigo-600">' + filterText + '</span>' : ''}\`;
                }
                
                // Atualizar lista de vagas
                if (jobsList) {
                  if (filteredJobs.length === 0) {
                    const emptyMessage = allJobs.length === 0 
                      ? 'Esta empresa ainda não possui vagas publicadas.'
                      : 'Nenhuma vaga encontrada com os filtros aplicados.';
                    
                    jobsList.parentElement.innerHTML = \`
                      <div class="text-center py-12">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">
                          \${allJobs.length === 0 ? 'Nenhuma vaga disponível' : 'Nenhuma vaga encontrada'}
                        </h3>
                        <p class="text-gray-600">\${emptyMessage}</p>
                        \${(titleFilter || departmentFilter) ? \`
                          <div class="mt-4 text-sm text-gray-500">
                            <p>Filtros ativos:</p>
                            \${titleFilter ? '<p>• Título: "' + titleFilter + '"</p>' : ''}
                            \${departmentFilter ? '<p>• Departamento: "' + departmentFilter + '"</p>' : ''}
                          </div>
                        \` : ''}
                      </div>
                    \`;
                  } else {
                    jobsList.innerHTML = filteredJobs.map(job => \`
                      <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div class="mb-4">
                          <h3 class="text-xl font-semibold text-gray-900 mb-2">\${job.title}</h3>
                          \${job.department ? \`
                            <div class="mb-2">
                              <span class="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                \${job.department.name}
                              </span>
                            </div>
                          \` : ''}
                          <div class="text-sm text-gray-500 mb-2">
                            <span class="inline-flex items-center">
                              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Publicada em: \${formatDate(job.publishedAt)}
                            </span>
                          </div>
                        </div>
                        <p class="text-gray-600 mb-4 line-clamp-3">
                          \${truncateText(job.description, 150)}
                        </p>
                        \${job.requirements ? \`
                          <div class="mb-4">
                            <h4 class="text-sm font-medium text-gray-900 mb-2">Requisitos:</h4>
                            <p class="text-sm text-gray-600 line-clamp-2">
                              \${truncateText(job.requirements, 100)}
                            </p>
                          </div>
                        \` : ''}
                        \${job.expirationDate ? \`
                          <div class="mb-4 text-sm text-gray-600">
                            <span class="inline-flex items-center">
                              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Expira em: \${formatDate(job.expirationDate)}
                            </span>
                          </div>
                        \` : ''}
                        <div class="flex gap-2">
                          <a 
                            href="http://${slug}.jobs.localhost/\${job.slug}"
                            class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors text-center"
                          >
                            Ver Mais
                          </a>
                          <button class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                            Candidatar-se
                          </button>
                        </div>
                      </div>
                    \`).join('');
                  }
                }
              }
              
              // Event listeners
              if (titleInput) {
                titleInput.addEventListener('input', function(e) {
                  titleFilter = e.target.value;
                  updateUI();
                });
              }
              
              if (departmentSelect) {
                departmentSelect.addEventListener('change', function(e) {
                  departmentFilter = e.target.value;
                  updateUI();
                });
              }
              
              if (clearButton) {
                clearButton.addEventListener('click', function() {
                  titleFilter = '';
                  departmentFilter = '';
                  if (titleInput) titleInput.value = '';
                  if (departmentSelect) departmentSelect.value = '';
                  updateUI();
                });
              }
              
              // Inicialização
              updateUI();
            });
          </script>
        </body>
      </html>
    `;
    }

    renderJob(companySlug: string, jobData: JobResponse): string {
        const companyName = companySlug.charAt(0).toUpperCase() + companySlug.slice(1);
        const content = renderToString(React.createElement(JobDetail, { 
            job: jobData.data, 
            companyName, 
            companySlug 
        }));
        
        return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${jobData.data.title} - ${companyName} Jobs</title>
          <meta name="description" content="${jobData.data.description.substring(0, 160)}..." />
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    indigo: {
                      50: '#eef2ff',
                      100: '#e0e7ff',
                      600: '#4f46e5',
                      700: '#4338ca',
                    }
                  }
                }
              }
            }
          </script>
        </head>
        <body>
          <div id="root">${content}</div>
          <script>
            // Dados da vaga para interatividade no cliente
            window.JOB_DATA = {
              companySlug: ${JSON.stringify(companySlug)},
              job: ${JSON.stringify(jobData.data)}
            };
            
            // Funcionalidades interativas
            document.addEventListener('DOMContentLoaded', function() {
              // Botão de candidatura
              const applyButton = document.querySelector('#apply-button');
              if (applyButton) {
                applyButton.addEventListener('click', function() {
                  alert('Funcionalidade de candidatura será implementada em breve!');
                });
              }
              
              // Botão de candidatura rápida
              const quickApplyButton = document.querySelector('#quick-apply-button');
              if (quickApplyButton) {
                quickApplyButton.addEventListener('click', function() {
                  alert('Funcionalidade de candidatura será implementada em breve!');
                });
              }
            });
          </script>
        </body>
      </html>
    `;
    }

    renderJobError(companySlug: string, jobSlug: string, errorMessage: string): string {
        const companyName = companySlug.charAt(0).toUpperCase() + companySlug.slice(1);
        
        return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Vaga não encontrada - ${companyName} Jobs</title>
          <meta name="description" content="Vaga não encontrada ou não está disponível." />
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    indigo: {
                      50: '#eef2ff',
                      100: '#e0e7ff',
                      600: '#4f46e5',
                      700: '#4338ca',
                    }
                  }
                }
              }
            }
          </script>
        </head>
        <body>
          <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div class="text-center">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">
                Vaga não encontrada
              </h1>
              <p class="text-gray-600 mb-4">
                A vaga solicitada não foi encontrada ou não está disponível.
              </p>
              <div class="text-sm text-gray-500 mb-6">
                <p>Slug da empresa: ${companySlug}</p>
                <p>Slug da vaga: ${jobSlug}</p>
                <p>Erro: ${errorMessage}</p>
              </div>
              <a 
                href="http://${companySlug}.jobs.localhost/"
                class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                ← Voltar às Vagas
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
    }
}
