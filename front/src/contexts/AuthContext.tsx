import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { AuthResponse } from '../types/Auth';

interface AuthContextType {
  currentUser: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: any) => Promise<AuthResponse>;
  logout: () => void;
  clearAuthData: () => void;
  refreshAuthData: () => Promise<void>;
  forceReauth: () => Promise<void>;
  clearAllAuthData: () => void;
  isAdmin: () => boolean;
  hasRole: (roleCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Listener para sincronizar mudanças de autenticação entre abas
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authData') {
        checkAuthStatus();
      }
    };

    // Listener para quando a aba ganha foco (para sincronizar com outras abas)
    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const checkAuthStatus = async () => {
    // Limpar dados inconsistentes primeiro
    apiService.clearInconsistentData();
    
    // Verificar se há dados de autenticação em outras abas
    if (!apiService.isAuthenticated() && apiService.hasAuthDataInOtherTabs()) {
      apiService.syncWithOtherTabs();
    }
    
    // Carregar dados locais como fallback inicial
    const storedUserData = apiService.getUserData();
    if (storedUserData && apiService.isAuthenticated()) {
      setCurrentUser(storedUserData);
      setIsAuthenticated(true);
    }
    
    if (apiService.isAuthenticated()) {
      try {
        const user = await apiService.getProfile();
        
        // Validar se os dados do servidor são consistentes
        if (!user.id || !user.email) {
          apiService.removeToken();
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }
        
        // Sempre atualizar com os dados do servidor (fonte da verdade)
        apiService.setToken(apiService.getToken()!, user);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error: any) {
        apiService.removeToken();
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
    setIsLoading(false);
  };

  const login = async (loginData: any) => {
    try {
      // Limpar todos os dados antigos antes do novo login
      clearAllAuthData();
      
      const response = await apiService.login(loginData);
      
      // Validar se o usuário logado corresponde ao email digitado
      if (response.user.email !== loginData.email) {
        throw new Error('Erro de autenticação: usuário não corresponde');
      }
      
      // Armazenar token e dados do usuário
      apiService.setToken(response.access_token, response.user);
      
      // Disparar evento para notificar outras abas
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'authData',
        newValue: JSON.stringify({
          token: response.access_token,
          userData: response.user,
          timestamp: Date.now(),
        }),
      }));
      
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.removeToken();
    
    // Disparar evento para notificar outras abas
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'authData',
      newValue: null,
    }));
    
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const clearAuthData = () => {
    apiService.removeToken();
    
    // Disparar evento para notificar outras abas
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'authData',
      newValue: null,
    }));
    
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const refreshAuthData = async () => {
    if (apiService.isAuthenticated()) {
      try {
        const user = await apiService.getProfile();
        apiService.setToken(apiService.getToken()!, user);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        clearAuthData();
      }
    }
  };

  const forceReauth = async () => {
    clearAuthData();
    
    // Limpar todos os dados de storage
    sessionStorage.clear();
    localStorage.clear();
    
    // Recarregar a página para garantir limpeza completa
    window.location.reload();
  };

  const clearAllAuthData = () => {
    // Limpar sessionStorage
    sessionStorage.clear();
    
    // Limpar localStorage
    localStorage.clear();
    
    // Limpar estado
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    return currentUser?.roleCode === 'ADMIN';
  };

  const hasRole = (roleCode: string) => {
    return currentUser?.roleCode === roleCode;
  };

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    clearAuthData,
    refreshAuthData,
    forceReauth,
    clearAllAuthData,
    isAdmin,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 