// Configuração do frontend
export interface AppConfig {
  backendUrl: string;
  companySlug: string;
}

// Função para obter o slug da empresa do subdomínio atual
function getCompanySlugFromDomain(): string {
  const hostname = window.location.hostname;
  
  // Padrão: slug-empresa.localhost
  const domainMatch = hostname.match(/^([^.]+)\.localhost$/);
  if (domainMatch) {
    return domainMatch[1];
  }
  
  // Padrão: localhost (desenvolvimento local)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return import.meta.env.VITE_DEFAULT_COMPANY_SLUG || 'gupy';
  }
  
  // Padrão: produção (ex: gupy.meudominio.com)
  const productionMatch = hostname.match(/^([^.]+)\./);
  if (productionMatch) {
    return productionMatch[1];
  }
  
  return import.meta.env.VITE_DEFAULT_COMPANY_SLUG || 'gupy';
}

// Função para construir a URL do backend baseada no slug da empresa
function buildBackendUrl(companySlug: string): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Se uma URL específica foi configurada via variável de ambiente, usá-la
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Se estamos em localhost, usar a configuração padrão
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  // Novo padrão: mesmo domínio com /api/ para o backend
  // Ex: gupy.localhost -> https://gupy.localhost/api
  if (hostname.includes('.localhost')) {
    return `${protocol}//${hostname}/api`;
  }
  
  // Padrão: produção (ex: gupy.meudominio.com -> https://gupy.meudominio.com/api)
  if (hostname.includes('.')) {
    return `${protocol}//${hostname}/api`;
  }
  
  // Fallback para desenvolvimento local
  return 'http://localhost:3000';
}

// Configuração da aplicação
export const appConfig: AppConfig = {
  companySlug: getCompanySlugFromDomain(),
  backendUrl: buildBackendUrl(getCompanySlugFromDomain()),
};

// Função para obter a configuração atualizada (útil para mudanças dinâmicas)
export function getCurrentConfig(): AppConfig {
  const companySlug = getCompanySlugFromDomain();
  return {
    companySlug,
    backendUrl: buildBackendUrl(companySlug),
  };
}

// Função para validar se a configuração está correta
export function validateConfig(): boolean {
  const config = getCurrentConfig();
  
  if (!config.companySlug || config.companySlug === '') {
    console.error('Slug da empresa não pôde ser determinado');
    return false;
  }
  
  if (!config.backendUrl || config.backendUrl === '') {
    console.error('URL do backend não pôde ser construída');
    return false;
  }
  
  return true;
}

// Log da configuração para debug
if (import.meta.env.DEV) {
  console.log('🔧 Configuração da aplicação:', appConfig);
  console.log('🌐 Hostname atual:', window.location.hostname);
  console.log('🏢 Slug da empresa:', appConfig.companySlug);
  console.log('🔗 URL do backend:', appConfig.backendUrl);
}
