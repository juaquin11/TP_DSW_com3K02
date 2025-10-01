import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';
import Logo from './logo';
import ProfileIcon from './ProfileIcon';

const Navbar: React.FC = () => {  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Determina la ruta del home según el rol del usuario
  const homePath = user?.type === 'owner' ? '/ownerDashboard' : '/';
  
  const handleLogout = () => { 
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.topNav}>
          <div className={styles.logo}>
            <Link to={homePath}>
              <Logo width="5rem" height="5rem" />
            </Link>
            <h1>
              <Link to={homePath}>FoodApp</Link>
            </h1>
          </div>
          <div className={styles.actions}>
            {user ? (
              <>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Logout
                </button>
                {/* Ahora pasamos los datos reales del contexto al ProfileIcon */}
                <ProfileIcon 
                  userType={user.type}
                  hasSubscription={user.hasActiveSubscription}
                  notificationCount={user.notificationCount}
                  hasPenalty={user.hasActivePenalty}
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
