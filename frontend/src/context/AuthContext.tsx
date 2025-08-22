import React, { createContext, useState, useEffect, useContext } from 'react';
import { type JwtPayload, jwtDecode } from 'jwt-decode';

interface AuthContextType {
    user: JwtPayload | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<JwtPayload | null>(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode<JwtPayload>(token);
                setUser(decoded);
            } catch (error) {
                console.error('Invalid token:', error);
                setToken(null);
                localStorage.removeItem('token');
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    const value = { user, token, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}