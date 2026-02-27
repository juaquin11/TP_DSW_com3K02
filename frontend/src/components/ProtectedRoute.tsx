import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'owner' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredUserType }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    } else if (requiredUserType && user && user.type !== requiredUserType) {
      navigate('/', { replace: true });
    }
  }, [token, user, navigate, requiredUserType]);

  if (!token) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Verificando autenticación...</div>;
  }

  if (requiredUserType && (!user || user.type !== requiredUserType)) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Verificando permisos...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
