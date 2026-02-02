/**
 * Authentication Context for React Native
 * Manages authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, User } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  loginPin: (pin: string) => Promise<void>;
  loginBiometric: (biometricData: string, biometricType: 'faceid' | 'fingerprint') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginPin = async (pin: string) => {
    try {
      const response = await authApi.loginPin(pin);
      setIsAuthenticated(true);
      setUser(response.user);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginBiometric = async (biometricData: string, biometricType: 'faceid' | 'fingerprint') => {
    try {
      const response = await authApi.loginBiometric(biometricData, biometricType);
      setIsAuthenticated(true);
      setUser(response.user);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
    } catch (error) {
      console.error('Biometric login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        loginPin,
        loginBiometric,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
