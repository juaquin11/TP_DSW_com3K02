import React, { useState, useEffect, useCallback } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/userService';
import type { UserProfile } from '../types/user';
import styles from './ProfilePage.module.css';
import UserData from '../components/profile/UserData';
import UserReservations from '../components/profile/UserReservations'; 


// componentes placeholder, ire borrando a medida que los agregue
// const UserData = ({ profile }: { profile: UserProfile }) => <div>Datos del Usuario: {profile.name}</div>;
// const UserReservations = ({ profile }: { profile: UserProfile }) => <div>{profile.reservations.length} Reservas</div>;
const UserSubscription = ({ profile }: { profile: UserProfile }) => <div>Suscripción: {profile.subscription?.plan_name || 'Ninguna'}</div>;
const UserPenalties = ({ profile }: { profile: UserProfile }) => <div>{profile.penalties.length} Penalizaciones</div>;


const ProfilePage: React.FC = () => {
  const { user, token, logout, refreshUserStatus } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('data');

  const loadProfile = useCallback(async () => {
    if (!token) {
      setError("No estás autenticado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchUserProfile(token);
      setProfileData(data);
    } catch (err) {
      setError("No se pudo cargar tu perfil. Intenta de nuevo.");
      console.error(err);
      if ((err as any).response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileUpdate = (updatedProfileData: Partial<UserProfile>) => {
    setProfileData(prev => prev ? { ...prev, ...updatedProfileData } : null);
    refreshUserStatus();
  };

  const renderContent = () => {
    if (!profileData) return null;

    switch (activeTab) {
      case 'data':
        return <UserData profile={profileData} onProfileUpdate={handleProfileUpdate} />;
      case 'reservations':
        return <UserReservations reservations={profileData.reservations} onReviewSubmit={loadProfile} />;
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
  ];
  
  if (user?.type === 'client') {
    adminOptions.push({ id: 'reservations', label: 'Mis Reservas' });
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