import React from 'react';
import { useConfig } from '../hooks/useConfig';

interface ConfigDebugProps {
  show?: boolean;
}

/**
 * Componente para debug da configuração da aplicação
 * Útil para desenvolvimento e troubleshooting
 */
export const ConfigDebug: React.FC<ConfigDebugProps> = ({ show = false }) => {
  const { companySlug, backendUrl, isLoading, isValid, error } = useConfig();

  // Só mostrar em desenvolvimento ou quando explicitamente solicitado
  if (!import.meta.env.DEV && !show) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm">
        <div className="text-blue-800">🔄 Carregando configuração...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm max-w-xs">
      <div className="font-semibold text-gray-800 mb-2">🔧 Configuração</div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">🏢 Empresa:</span>
          <span className="font-mono text-gray-800">{companySlug}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">🔗 Backend:</span>
          <span className="font-mono text-gray-800 break-all">{backendUrl}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">✅ Status:</span>
          <span className={isValid ? 'text-green-600' : 'text-red-600'}>
            {isValid ? 'Válido' : 'Inválido'}
          </span>
        </div>
        
        {error && (
          <div className="text-red-600 text-xs mt-2">
            ❌ Erro: {error}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        Host: {window.location.hostname}
      </div>
    </div>
  );
};

export default ConfigDebug;
