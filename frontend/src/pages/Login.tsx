import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import styles from './Login.module.css';
import type { LoginDTO } from '../types/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const loginData: LoginDTO = { email, password };

    try {
      const result = await loginUser(loginData);
      login(result.token);
      alert('¡Bienvenido! Has iniciado sesión correctamente.');

      if (result.user.type === 'owner') {
        navigate('/ownerDashboard'); // Redirige a una ruta para dueños
      } else {
        navigate('/'); // Redirige al home para clientes
      }
    } catch (err: any) {
      console.error('❌ Error al iniciar sesión:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Email o contraseña incorrectos.');
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
