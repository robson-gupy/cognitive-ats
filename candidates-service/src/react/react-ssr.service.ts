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
                      const applicationData = await response.json();
                      
                      // Se temos o ID da application, abrir modal de perguntas
                      if (applicationData && applicationData.id) {
                        showQuestionsModal(applicationData.id);
                      } else {
                        // Sucesso sem perguntas
                        alert('Inscrição realizada com sucesso!');
                        form.reset();
                      }
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

              // Função para mostrar o modal de perguntas
              function showQuestionsModal(applicationId) {
                // Criar o modal
                const modal = document.createElement('div');
                modal.id = 'questions-modal';
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = \`
                  <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                      <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-900">
                          Perguntas da Vaga
                        </h3>
                        <button
                          id="close-questions-modal"
                          class="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div class="mt-4">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                          <span id="question-counter">Pergunta 1 de 1</span>
                          <span id="question-progress">0%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div
                            id="progress-bar"
                            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style="width: 0%"
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div id="questions-content" class="px-6 py-6 flex-1 overflow-y-auto">
                      <div class="text-center py-8">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p class="text-gray-600">Carregando perguntas...</p>
                      </div>
                    </div>

                    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div class="flex justify-between">
                        <button
                          id="prev-question"
                          class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed"
                          disabled
                        >
                          Anterior
                        </button>
                        
                        <div class="flex space-x-3">
                          <button
                            id="next-question"
                            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed"
                            disabled
                          >
                            Próxima
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                \`;

                document.body.appendChild(modal);

                // Buscar perguntas da vaga
                fetchQuestions(applicationId);

                // Event listeners
                document.getElementById('close-questions-modal').addEventListener('click', () => {
                  closeQuestionsModal();
                });

                // Fechar modal ao clicar fora
                modal.addEventListener('click', (e) => {
                  if (e.target === modal) {
                    closeQuestionsModal();
                  }
                });
              }

              // Função para buscar perguntas
              async function fetchQuestions(applicationId) {
                try {
                  const response = await fetch(\`/public/\${companySlug}/jobs/\${job.slug}/questions\`);
                  
                  if (!response.ok) {
                    throw new Error('Erro ao buscar perguntas da vaga');
                  }
                  
                  const data = await response.json();
                  
                  if (data.success && data.data) {
                    // Ordenar perguntas por orderIndex
                    const questions = data.data.sort((a, b) => a.orderIndex - b.orderIndex);
                    renderQuestions(questions, applicationId);
                  } else {
                    throw new Error(data.message || 'Erro ao buscar perguntas');
                  }
                } catch (err) {
                  showError(err.message || 'Erro ao buscar perguntas');
                }
              }

              // Função para renderizar perguntas
              function renderQuestions(questions, applicationId) {
                let currentQuestionIndex = 0;
                const responses = questions.map(q => ({ jobQuestionId: q.id, answer: '' }));

                function updateQuestionDisplay() {
                  const question = questions[currentQuestionIndex];
                  const content = document.getElementById('questions-content');
                  const counter = document.getElementById('question-counter');
                  const progress = document.getElementById('question-progress');
                  const progressBar = document.getElementById('progress-bar');
                  const prevBtn = document.getElementById('prev-question');
                  const nextBtn = document.getElementById('next-question');

                  // Atualizar contador e progresso
                  counter.textContent = \`Pergunta \${currentQuestionIndex + 1} de \${questions.length}\`;
                  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
                  progress.textContent = \`\${progressPercent}%\`;
                  progressBar.style.width = \`\${progressPercent}%\`;

                  // Atualizar botões
                  prevBtn.disabled = currentQuestionIndex === 0;
                  prevBtn.className = \`px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors \${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}\`;

                  if (currentQuestionIndex === questions.length - 1) {
                    nextBtn.textContent = 'Concluir';
                    nextBtn.className = 'px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors';
                  } else {
                    nextBtn.textContent = 'Próxima';
                    nextBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors';
                  }

                  // Renderizar pergunta atual
                  content.innerHTML = \`
                    <div class="mb-6">
                      <h4 class="text-lg font-medium text-gray-900 mb-4">
                        \${question.question}
                      </h4>
                      
                      \${question.isRequired ? '<p class="text-sm text-red-600 mb-4">* Esta pergunta é obrigatória</p>' : ''}
                      
                      <textarea
                        id="question-answer"
                        placeholder="Digite sua resposta aqui..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="4"
                        required="\${question.isRequired}"
                      >\${responses[currentQuestionIndex].answer}</textarea>
                    </div>
                  \`;

                  // Salvar resposta ao digitar
                  const textarea = document.getElementById('question-answer');
                  textarea.addEventListener('input', (e) => {
                    responses[currentQuestionIndex].answer = e.target.value;
                    
                    // Verificar se pode ir para próxima após digitar
                    const currentResponse = responses[currentQuestionIndex];
                    const hasAnswer = currentResponse && currentResponse.answer.trim() !== '';
                    const isRequired = question.isRequired;
                    
                    // Botão próxima desabilitado apenas se a pergunta for obrigatória e não tiver resposta
                    nextBtn.disabled = isRequired && !hasAnswer;
                    
                    // Aplicar estilos de acordo com o estado
                    if (nextBtn.disabled) {
                      nextBtn.className = \`\${nextBtn.className.replace(' opacity-50 cursor-not-allowed', '')} opacity-50 cursor-not-allowed\`;
                    } else {
                      // Remover classes de desabilitado
                      nextBtn.className = nextBtn.className.replace(' opacity-50 cursor-not-allowed', '');
                    }
                  });

                  // Verificar se pode ir para próxima inicialmente
                  const currentResponse = responses[currentQuestionIndex];
                  const hasAnswer = currentResponse && currentResponse.answer.trim() !== '';
                  const isRequired = question.isRequired;
                  
                  // Botão próxima desabilitado apenas se a pergunta for obrigatória e não tiver resposta
                  nextBtn.disabled = isRequired && !hasAnswer;
                  
                  // Aplicar estilos de acordo com o estado
                  if (nextBtn.disabled) {
                    nextBtn.className = \`\${nextBtn.className} opacity-50 cursor-not-allowed\`;
                  }
                }

                // Event listeners para navegação
                document.getElementById('prev-question').addEventListener('click', () => {
                  if (currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    updateQuestionDisplay();
                  }
                });

                document.getElementById('next-question').addEventListener('click', async () => {
                  if (currentQuestionIndex < questions.length - 1) {
                    currentQuestionIndex++;
                    updateQuestionDisplay();
                  } else {
                    // Última pergunta - enviar respostas
                    await submitResponses(responses, applicationId);
                  }
                });

                // Inicializar primeira pergunta
                updateQuestionDisplay();
              }

              // Função para enviar respostas
              async function submitResponses(responses, applicationId) {
                try {
                  const nextBtn = document.getElementById('next-question');
                  nextBtn.disabled = true;
                  nextBtn.textContent = 'Enviando...';

                  const response = await fetch(\`/jobs/\${job.id}/applications/\${applicationId}/question-responses/multiple\`, {
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

                  // Sucesso - mostrar mensagem e fechar modal
                  showSuccess();
                } catch (err) {
                  showError(err.message || 'Erro ao enviar respostas');
                  nextBtn.disabled = false;
                  nextBtn.textContent = 'Concluir';
                }
              }

              // Função para mostrar sucesso
              function showSuccess() {
                const content = document.getElementById('questions-content');
                content.innerHTML = \`
                  <div class="text-center py-8">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Sucesso!</h3>
                    <p class="text-gray-600 mb-4">
                      Todas as suas respostas foram enviadas com sucesso. Sua candidatura está completa!
                    </p>
                    <p class="text-sm text-gray-500">
                      Redirecionando em alguns segundos...
                    </p>
                  </div>
                \`;

                // Fechar modal após 3 segundos
                setTimeout(() => {
                  closeQuestionsModal();
                  // Recarregar página ou mostrar mensagem de sucesso
                  alert('Candidatura realizada com sucesso! Todas as suas respostas foram enviadas.');
                  location.reload();
                }, 3000);
              }

              // Função para mostrar erro
              function showError(message) {
                const content = document.getElementById('questions-content');
                content.innerHTML = \`
                  <div class="text-center py-8">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p class="text-red-600 mb-4">\${message}</p>
                    <button
                      id="retry-questions"
                      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                \`;

                document.getElementById('retry-questions').addEventListener('click', () => {
                  location.reload();
                });
              }

              // Função para fechar modal
              function closeQuestionsModal() {
                const modal = document.getElementById('questions-modal');
                if (modal) {
                  modal.remove();
                }
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
