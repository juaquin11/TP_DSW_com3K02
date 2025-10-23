import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Register.module.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<'client' | 'owner'>('client');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !password) {
      const errorMsg = 'Todos los campos son obligatorios.';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    try {
      const result = await registerUser({ name, email, phone, password, type });
      login(result.token);
      success('Usuario registrado exitosamente. ¡Bienvenido!');

      if (result.user.type === 'owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('❌ Error al registrar:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Error al registrar el usuario. Intente nuevamente.';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <main className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Registro</h1>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="phone">Teléfono:</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
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
        <div className={styles.inputGroup}>
          <label htmlFor="userType">Tipo de usuario:</label>
          <select
            id="userType"
            value={type}
            onChange={(e) => setType(e.target.value as 'client' | 'owner')}
            className={styles.select}
          >
            <option value="client">Cliente</option>
            <option value="owner">Dueño</option>
          </select>
        </div>
        <button type="submit" className={styles.button}>
          Registrarse
        </button>
      </form>
    </main>
  );
}

export default Register;