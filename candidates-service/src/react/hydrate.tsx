import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { JobDetail } from './JobDetail';

// Função para hidratar o componente JobDetail
function hydrateJobDetail() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Elemento root não encontrado');
    return;
  }

  // Verificar se temos os dados da vaga
  if (!window.JOB_DATA) {
    console.error('Dados da vaga não encontrados');
    return;
  }

  const { companySlug, job } = window.JOB_DATA;
  const companyName = companySlug.charAt(0).toUpperCase() + companySlug.slice(1);

  try {
    // Hidratar o componente React
    hydrateRoot(
      rootElement,
      React.createElement(JobDetail, {
        job,
        companyName,
        companySlug,
      })
    );
    
    console.log('React hidratado com sucesso');
  } catch (error) {
    console.error('Erro ao hidratar React:', error);
  }
}

// Executar hidratação quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrateJobDetail);
} else {
  hydrateJobDetail();
}

// Declaração global para TypeScript
declare global {
  interface Window {
    JOB_DATA: {
      companySlug: string;
      job: any;
    };
  }
}
