// frontend/src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loginUser } from '../services/authService';
import styles from './Login.module.css';
import type { LoginDTO } from '../types/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const loginData: LoginDTO = { email, password };

    try {
      const result = await loginUser(loginData);
      const loggedInUser = await login(result.token);
      
      success('¡Bienvenido! Has iniciado sesión correctamente.');

      if (loggedInUser.type === 'owner') {
        navigate('/ownerDashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('❌ Error al iniciar sesión:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Email o contraseña incorrectos.';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <main className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Iniciar Sesión</h1>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.button}>
          Ingresar
        </button>
        <p className={styles.linkText}>
          ¿No tienes una cuenta? <Link to="/register" className={styles.link}>Regístrate aquí</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;