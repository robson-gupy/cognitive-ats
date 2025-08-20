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
