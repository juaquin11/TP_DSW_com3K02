import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload, AuthenticatedUser, UserStatus } from '../types/auth';
import { fetchUserStatus } from '../services/userService';

interface AuthContextType {
  user: AuthenticatedUser | null;
  token: string | null;
  login: (token: string) => Promise<AuthenticatedUser>;
  logout: () => void;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  // logout 
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []); // Dependencia vacía

  useEffect(() => {
    const initializeUser = async () => {
      if (token && !user) { 
        try {
          const decodedJwt = jwtDecode<JwtPayload>(token);
          if (decodedJwt.exp && decodedJwt.exp * 1000 < Date.now()) {
            logout();
            return;
          }
          const userStatus: UserStatus = await fetchUserStatus(token);
          setUser({ ...decodedJwt, ...userStatus });
        } catch (error) {
          console.error('Sesión inválida:', error);
          logout();
        }
      }
    };
    initializeUser();
  }, [token, user, logout]);


  const login = useCallback(async (newToken: string): Promise<AuthenticatedUser> => {
    const decodedJwt = jwtDecode<JwtPayload>(newToken);
    const userStatus = await fetchUserStatus(newToken);
    const fullUser: AuthenticatedUser = { ...decodedJwt, ...userStatus };

    localStorage.setItem('token', newToken);
    setUser(fullUser);
    setToken(newToken);
    
    return fullUser;
  }, []); // Dependencia vacía

  
  const refreshUserStatus = useCallback(async () => {
    if (token) {
      try {
        const userStatus = await fetchUserStatus(token);
        setUser(prevUser => prevUser ? { ...prevUser, ...userStatus } : null);
      } catch (error) {
        console.error("Error al refrescar el estado del usuario", error);
        logout(); // 'logout' es estable gracias a su propio useCallback
      }
    }
  }, [token, logout]); // Depende de 'token' y 'logout'


  const value = useMemo(() => ({ 
    user, 
    token, 
    login, 
    logout, 
    refreshUserStatus 
  }), [user, token, login, logout, refreshUserStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}