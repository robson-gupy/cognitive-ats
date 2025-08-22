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
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
          <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
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
            
            // Hidratação do React e funcionalidades interativas
            document.addEventListener('DOMContentLoaded', function() {
              console.log('DOM carregado, iniciando hidratação...');
              
              // Verificar se temos os dados necessários
              if (!window.JOB_DATA) {
                console.error('Dados da vaga não encontrados');
                return;
              }
              
              const { companySlug, job } = window.JOB_DATA;
              const companyName = companySlug.charAt(0).toUpperCase() + companySlug.slice(1);
              
              // Função para criar o formulário de inscrição
              function createApplicationForm() {
                const formContainer = document.querySelector('.application-form-container');
                if (!formContainer) return;
                
                // Remover formulário existente se houver
                formContainer.innerHTML = '';
                
                // Criar formulário HTML
                const form = document.createElement('form');
                form.method = 'POST';
                form.className = 'space-y-4';
                form.innerHTML = \`
                  <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-6">
                      Candidatar-se para esta Vaga
                    </h3>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                          Nome *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Seu nome"
                        />
                      </div>
                      
                      <div>
                        <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                          Sobrenome *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Seu sobrenome"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="seu@email.com"
                      />
                    </div>
                    
                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <label for="resume" class="block text-sm font-medium text-gray-700 mb-1">
                        Currículo (PDF) - Opcional
                      </label>
                      <input
                        type="file"
                        id="resume"
                        name="resume"
                        accept=".pdf"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p class="text-xs text-gray-500 mt-1">
                        Aceitamos apenas arquivos PDF. Tamanho máximo: 10MB.
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      class="w-full bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Enviar Candidatura
                    </button>
                  </div>
                \`;
                
                // Adicionar evento de submit
                form.addEventListener('submit', async function(e) {
                  e.preventDefault();
                  console.log('Formulário submetido via JavaScript');
                  
                  const formData = new FormData(form);
                  const firstName = formData.get('firstName');
                  const lastName = formData.get('lastName');
                  const email = formData.get('email');
                  const phone = formData.get('phone');
                  const resumeFile = formData.get('resume');
                  
                  try {
                    let response;
                    
                    if (resumeFile && resumeFile.size > 0) {
                      // Com currículo
                      const formDataToSend = new FormData();
                      formDataToSend.append('firstName', firstName);
                      formDataToSend.append('lastName', lastName);
                      formDataToSend.append('email', email);
                      formDataToSend.append('phone', phone);
                      formDataToSend.append('resume', resumeFile);
                      
                      response = await fetch(\`/jobs/\${job.id}/applications/upload-resume\`, {
                        method: 'POST',
                        body: formDataToSend,
                      });
                    } else {
                      // Sem currículo
                      response = await fetch(\`/jobs/\${job.id}/applications\`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          firstName,
                          lastName,
                          email,
                          phone,
                          jobId: job.id,
                        }),
                      });
                    }
                    
                    if (response.ok) {
                      // Sucesso
                      alert('Inscrição realizada com sucesso!');
                      form.reset();
                    } else {
                      const errorData = await response.json().catch(() => ({}));
                      alert('Erro ao enviar inscrição: ' + (errorData.message || 'Erro desconhecido'));
                    }
                  } catch (error) {
                    console.error('Erro ao enviar inscrição:', error);
                    alert('Erro ao enviar inscrição: ' + error.message);
                  }
                });
                
                formContainer.appendChild(form);
              }
              
              // Criar o formulário
              createApplicationForm();
              
              console.log('Hidratação concluída');
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
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
