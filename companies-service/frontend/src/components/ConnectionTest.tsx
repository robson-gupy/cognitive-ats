import React, { useState } from 'react';
import { useConfig } from '../hooks/useConfig';

export const ConnectionTest: React.FC = () => {
  const { companySlug, backendUrl } = useConfig();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testando conexão...');
    
    try {
      // Teste 1: Verificar se a URL está correta
      console.log('🔗 Testando URL:', backendUrl);
      console.log('🏢 Slug da empresa:', companySlug);
      
      // Teste 2: Fazer uma requisição OPTIONS (preflight CORS)
      const optionsResponse = await fetch(`${backendUrl}/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });
      
      console.log('✅ OPTIONS response:', optionsResponse.status, optionsResponse.headers);
      
      // Teste 3: Fazer uma requisição POST real
      const postResponse = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test'
        }),
      });
      
      console.log('✅ POST response:', postResponse.status, postResponse.headers);
      
      const responseText = await postResponse.text();
      console.log('📄 Response body:', responseText);
      
      setTestResult(`✅ Conexão bem-sucedida!
        OPTIONS: ${optionsResponse.status}
        POST: ${postResponse.status}
        URL: ${backendUrl}
        Origin: ${window.location.origin}
      `);
      
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      setTestResult(`❌ Erro na conexão: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-semibold text-gray-800 mb-2">🔧 Teste de Conexão</h3>
      
      <div className="space-y-2 text-xs mb-3">
        <div><strong>Slug:</strong> {companySlug}</div>
        <div><strong>Backend URL:</strong> {backendUrl}</div>
        <div><strong>Origin:</strong> {window.location.origin}</div>
      </div>
      
      <button
        onClick={testConnection}
        disabled={isLoading}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testando...' : 'Testar Conexão'}
      </button>
      
      {testResult && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs whitespace-pre-line">
          {testResult}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;
