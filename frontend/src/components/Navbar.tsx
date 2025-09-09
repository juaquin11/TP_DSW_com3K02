// frontend/src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';
import Logo from './logo';
import ProfileIcon from './ProfileIcon';

const Navbar: React.FC = () => {  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Lógica simulada para las notificaciones y suscripción
  const hasSubscription = user?.type === 'client' && user.id_user === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
  const hasPenalty = user?.type === 'client' && user.id_user === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
  const notificationCount = hasPenalty ? 2 : 5; // Simulación: 5 reseñas pendientes o 2 por penalidad

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.topNav}>
          <div className={styles.logo}>
            <Link to="/">
              <Logo width="5rem" height="5rem" />
            </Link>
            <h1>
              <Link to="/">FoodApp</Link>
            </h1>
          </div>
          <div className={styles.actions}>
            {user ? (
              <>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
                <ProfileIcon 
                  userType={user.type}
                  hasSubscription={hasSubscription}
                  notificationCount={notificationCount}
                  hasPenalty={hasPenalty}
                />
              </>
            ) : (
              <>
                <Link to="/login" className={styles.loginButton}>
                  Login
                </Link>
                <Link to="/register" className={styles.registerButton}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;