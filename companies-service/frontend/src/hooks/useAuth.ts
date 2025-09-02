import {useEffect, useState} from 'react';
import {apiService} from '../services/api';
import type {AuthResponse} from '../types/Auth';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    if (apiService.isAuthenticated()) {
      try {
        const user = await apiService.getProfile();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
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
      const response = await apiService.login(loginData);
      apiService.setToken(response.access_token);

      // Atualizar estado de forma síncrona
      setCurrentUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = () => {
    return currentUser?.roleCode === 'ADMIN';
  };

  const hasRole = (roleCode: string) => {
    return currentUser?.roleCode === roleCode;
  };

  const logout = () => {
    apiService.removeToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    isAdmin,
    hasRole,
    logout,
    checkAuthStatus,
    login,
  };
}; 