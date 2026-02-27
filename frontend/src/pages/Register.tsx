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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d+$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo permitir números
    if (value === '' || /^\d+$/.test(value)) {
      setPhone(value);
      if (fieldErrors.phone) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const newFieldErrors: Record<string, string> = {};

    if (!name || !email || !phone || !password) {
      const errorMsg = 'Todos los campos son obligatorios.';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    if (!validateEmail(email)) {
      newFieldErrors.email = 'El email no tiene un formato válido.';
    }

    if (!validatePhone(phone)) {
      newFieldErrors.phone = 'El teléfono solo debe contener números.';
    }

    if (password.length < 6) {
      newFieldErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      showError('Por favor, corrija los errores en el formulario.');
      return;
    }

    try {
      const result = await registerUser({ 
        name, 
        email, 
        phone, 
        password, 
        type
      });
      login(result.token);
      success('Usuario registrado exitosamente. ¡Bienvenido!');

      if (result.user.type === 'owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Error al registrar:', err.response?.data || err.message);
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
            onChange={handlePhoneChange}
            placeholder="Ej: 3512345678"
          />
          {fieldErrors.phone && <span className={styles.fieldError}>{fieldErrors.phone}</span>}
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="ejemplo@correo.com"
          />
          {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
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