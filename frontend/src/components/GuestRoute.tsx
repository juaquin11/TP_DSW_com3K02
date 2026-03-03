import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      // Si el usuario ya está autenticado, redirigir según su tipo
      if (user.type === 'owner') {
        navigate('/ownerDashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [token, user, navigate]);

  // Si ya está autenticado, mostrar mensaje mientras redirige
  if (token && user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Redirigiendo...</div>;
  }

  return <>{children}</>;
};

export default GuestRoute;
