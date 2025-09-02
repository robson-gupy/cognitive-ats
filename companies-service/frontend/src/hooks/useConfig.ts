import {useEffect, useState} from 'react';
import {appConfig, getCurrentConfig, validateConfig} from '../config/config';

export interface UseConfigReturn {
  companySlug: string;
  backendUrl: string;
  isLoading: boolean;
  isValid: boolean;
  error: string | null;
  refreshConfig: () => void;
}

/**
 * Hook para acessar a configuração da aplicação
 * Inclui validação automática e atualização dinâmica
 */
export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState(appConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para atualizar a configuração
  const refreshConfig = () => {
    try {
      const newConfig = getCurrentConfig();
      setConfig(newConfig);

      // Validar a nova configuração
      const valid = validateConfig();
      setIsValid(valid);

      if (!valid) {
        setError('Configuração inválida detectada');
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configuração');
      setIsValid(false);
    }
  };

  // Carregar configuração inicial
  useEffect(() => {
    const loadConfig = () => {
      setIsLoading(true);
      refreshConfig();
      setIsLoading(false);
    };

    loadConfig();

    // Atualizar configuração quando a janela ganhar foco
    const handleFocus = () => {
      refreshConfig();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return {
    companySlug: config.companySlug,
    backendUrl: config.backendUrl,
    isLoading,
    isValid,
    error,
    refreshConfig,
  };
}

/**
 * Hook para obter apenas o slug da empresa
 */
export function useCompanySlug(): string {
  const {companySlug} = useConfig();
  return companySlug;
}

/**
 * Hook para obter apenas a URL do backend
 */
export function useBackendUrl(): string {
  const {backendUrl} = useConfig();
  return backendUrl;
}
