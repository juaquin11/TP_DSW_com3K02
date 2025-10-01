import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload, AuthenticatedUser, UserStatus } from '../types/auth';
import { fetchUserStatus } from '../services/userService';

interface AuthContextType {
  user: AuthenticatedUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      if (token) {
        try {
          const decodedJwt = jwtDecode<JwtPayload>(token);
          
          // Valida que el token no haya expirado
          if (decodedJwt.exp && decodedJwt.exp * 1000 < Date.now()) {
            logout();
            return;
          }

          // Llama al backend para obtener el estado actualizado del usuario
          const userStatus: UserStatus = await fetchUserStatus(token);

          // Combina la info del JWT con el estado dinámico
          setUser({ ...decodedJwt, ...userStatus });

        } catch (error) {
          console.error('Token inválido o error al obtener estado del usuario:', error);
          logout();
        }
      } else {
        setUser(null);
      }
    };

    initializeUser();
  }, [token, logout]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };
  
  const refreshUserStatus = async () => {
    if (token) {
      try {
        const userStatus = await fetchUserStatus(token);
        setUser(prevUser => prevUser ? { ...prevUser, ...userStatus } : null);
      } catch (error) {
        console.error("Error al refrescar el estado del usuario", error);
        logout();
      }
    }
  };

  const value = { user, token, login, logout, refreshUserStatus };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
