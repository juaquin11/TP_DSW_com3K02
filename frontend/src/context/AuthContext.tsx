import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload, AuthenticatedUser, UserStatus } from '../types/auth';
import { fetchUserStatus } from '../services/userService';

interface AuthContextType {
  user: AuthenticatedUser | null;
  token: string | null;
  // La función login ahora es asíncrona
  login: (token: string) => Promise<AuthenticatedUser>;
  logout: () => void;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  // ... (el useEffect y logout se mantienen igual)
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    // Este efecto se encargará de rehidratar el estado si ya hay un token en localStorage
    // al recargar la página.
    const initializeUser = async () => {
      if (token && !user) { // Solo se ejecuta si hay token pero no usuario
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


  // --- FUNCIÓN LOGIN MODIFICADA ---
  const login = async (newToken: string): Promise<AuthenticatedUser> => {
    // 1. Decodificar el JWT
    const decodedJwt = jwtDecode<JwtPayload>(newToken);
    
    // 2. Obtener el estado del usuario desde el backend
    const userStatus = await fetchUserStatus(newToken);

    // 3. Crear el objeto de usuario completo
    const fullUser: AuthenticatedUser = { ...decodedJwt, ...userStatus };

    // 4. Actualizar el estado del contexto y el localStorage
    localStorage.setItem('token', newToken);
    setUser(fullUser);
    setToken(newToken);
    
    // 5. Devolver el usuario completo para que el componente Login pueda usarlo
    return fullUser;
  };
  
  // ... (el resto del componente se mantiene igual)
  
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