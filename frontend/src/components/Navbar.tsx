import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';
import Logo from './logo';
import ProfileIcon from './ProfileIcon';

type MenuOption = {
  label: string;
  path?: string;
  action?: () => void;
  tone?: 'danger';
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Determina la ruta del home según el rol del usuario
  const homePath = user?.type === 'owner' ? '/ownerDashboard' : '/';

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const menuOptions: MenuOption[] = useMemo(() => {
    if (!user) return [];

    if (user.type === 'owner') {
      return [
        { label: 'Inicio', path: homePath },
        { label: 'Mi perfil', path: '/profile' },
        { label: 'Panel de dueño', path: '/ownerDashboard' },
        { label: 'Ayuda', path: '/help' },
        { label: 'Cerrar sesión', action: handleLogout, tone: 'danger' },
      ];
    }

    return [
      { label: 'Inicio', path: homePath },
      { label: 'Mi perfil', path: '/profile' },
      { label: 'Suscripciones', path: '/profile?tab=subscription' },
      { label: 'Ayuda', path: '/help' },
      { label: 'Cerrar sesión', action: handleLogout, tone: 'danger' },
    ];
  }, [user, homePath, handleLogout]);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleOptionSelect = (option: MenuOption) => {
    setIsMenuOpen(false);

    if (option.action) {
      option.action();
      return;
    }

    if (option.path) {
      navigate(option.path);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.topNav}>
          <div className={styles.logo}>
            <Link to={homePath} aria-label="Ir al inicio">
              <Logo width="4rem" height="4rem" />
            </Link>
            <h1 className={styles.brandTitle}>
              <Link to={homePath}>FoodApp</Link>
            </h1>
          </div>
          <div className={styles.actions}>
            {user ? (
              <div className={styles.profileMenu} ref={menuRef}>
                <ProfileIcon
                  userType={user.type}
                  hasSubscription={user.hasActiveSubscription}
                  notificationCount={user.notificationCount}
                  hasPenalty={user.hasActivePenalty}
                  onClick={toggleMenu}
                  isMenuOpen={isMenuOpen}
                  label={user.type === 'owner' ? 'Panel dueño' : 'Mi cuenta'}
                />
                {isMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    {menuOptions.map(option => (
                      <button
                        key={option.label}
                        type="button"
                        className={`${styles.dropdownItem} ${option.tone === 'danger' ? styles.dropdownItemDanger : ''}`}
                        onClick={() => handleOptionSelect(option)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className={styles.loginButton}>
                  Iniciar sesión
                </Link>
                <Link to="/register" className={styles.registerButton}>
                  Crear cuenta
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