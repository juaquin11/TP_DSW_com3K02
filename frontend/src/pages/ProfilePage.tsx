import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/userService';
import type { UserProfile } from '../types/user';
import styles from './ProfilePage.module.css';

// componentes placeholder por ahora
const UserData = ({ profile }: { profile: UserProfile }) => <div>Datos del Usuario: {profile.name}</div>;
const UserReservations = ({ profile }: { profile: UserProfile }) => <div>{profile.reservations.length} Reservas</div>;
const UserSubscription = ({ profile }: { profile: UserProfile }) => <div>Suscripción: {profile.subscription?.plan_name || 'Ninguna'}</div>;
const UserPenalties = ({ profile }: { profile: UserProfile }) => <div>{profile.penalties.length} Penalizaciones</div>;


const ProfilePage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('data');

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setError("No estás autenticado.");
        setLoading(false);
        return;
      }
      try {
        const data = await fetchUserProfile(token);
        setProfileData(data);
      } catch (err) {
        setError("No se pudo cargar tu perfil. Intenta de nuevo.");
        console.error(err);
        // token = inválido, cerramos sesión
        if ((err as any).response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token, logout]);

  const renderContent = () => {
    if (!profileData) return null;

    switch (activeTab) {
      case 'data':
        return <UserData profile={profileData} />;
      case 'reservations':
        return <UserReservations profile={profileData} />;
      case 'subscription':
        return <UserSubscription profile={profileData} />;
      case 'penalties':
        return <UserPenalties profile={profileData} />;
      default:
        return null;
    }
  };
  
  const adminOptions = [
    { id: 'data', label: 'Mis Datos' },
    { id: 'reservations', label: 'Mis Reservas' },
  ];
  
  if (user?.type === 'client') {
    adminOptions.push({ id: 'subscription', label: 'Suscripción' });
    adminOptions.push({ id: 'penalties', label: 'Penalizaciones' });
  }


  if (loading) return <main className={styles.container}><p>Cargando perfil...</p></main>;
  if (error) return <main className={styles.container}><p className={styles.error}>{error}</p></main>;

  return (
    <main className={styles.container}>
      <h1 className={styles.mainTitle}>Mi Perfil</h1>
      <p className={styles.mainSubtitle}>Gestiona tu información personal, reservas y suscripciones.</p>

      <div className={styles.adminNav}>
        {adminOptions.map(opt => (
          <button
            key={opt.id}
            className={`${styles.navButton} ${activeTab === opt.id ? styles.active : ''}`}
            onClick={() => setActiveTab(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className={styles.contentArea}>
        {renderContent()}
      </div>
    </main>
  );
};

export default ProfilePage;