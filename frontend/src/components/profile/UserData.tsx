// frontend/src/components/profile/UserData.tsx

import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../../types/user';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/userService';
import styles from './UserData.module.css';

interface Props {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void; // Función para notificar al padre del cambio
}

const UserData: React.FC<Props> = ({ profile, onProfileUpdate }) => {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza el formulario si los datos del perfil cambian desde el padre
  useEffect(() => {
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
    });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({ name: profile.name || '', phone: profile.phone || '' });
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUserProfile(formData, token);
      onProfileUpdate(updatedUser); // Notifica al componente padre
      setIsEditing(false);
      alert('¡Datos actualizados con éxito!');
    } catch (err) {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Mis Datos</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className={styles.editButton}>
            Editar
          </button>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div className={styles.formGrid}>
          {/* ... (resto del formulario) ... */}
            <div className={styles.inputGroup}>
                <label htmlFor="name">Nombre</label>
                <input
                    id="name"
                    name="name" // Importante para el handleChange
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    disabled={!isEditing || isLoading}
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={profile.email} readOnly disabled />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="phone">Teléfono</label>
                <input
                    id="phone"
                    name="phone" // Importante para el handleChange
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    disabled={!isEditing || isLoading}
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="type">Tipo de Cuenta</label>
                <input 
                    id="type"
                    type="text"
                    value={profile.type === 'client' ? 'Cliente' : 'Dueño'}
                    readOnly
                    disabled
                />
            </div>
        </div>
        
        {error && <p className={styles.error}>{error}</p>}

        {isEditing && (
          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.cancelButton} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserData;