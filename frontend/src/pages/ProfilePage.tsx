import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/userService';
import type { UserProfile } from '../types/user';
import styles from './ProfilePage.module.css';
import UserData from '../components/profile/UserData';
import UserReservations from '../components/profile/UserReservations';
import UserSubscription from '../components/profile/UserSubscription'; 

const UserPenalties = ({ profile }: { profile: UserProfile }) => <div>{profile.penalties.length} Penalizaciones</div>;

type ProfileTab = 'data' | 'reservations' | 'subscription' | 'penalties';

const ProfilePage: React.FC = () => {
  const { user, token, logout, refreshUserStatus } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('data');


  const userOptions: { id: ProfileTab; label: string }[] = user?.type === 'client' 
    ? [
        { id: 'data', label: 'Mis Datos' },
        { id: 'reservations', label: 'Mis Reservas' },
        { id: 'subscription', label: 'Suscripción' },
        { id: 'penalties', label: 'Penalizaciones' },
      ]
    : [
        { id: 'data', label: 'Mis Datos' },
      ];

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

  if (loading) return <main className={styles.container}><p>Cargando perfil...</p></main>;
  if (error) return <main className={styles.container}><p className={styles.error}>{error}</p></main>;

  return (
    <main className={styles.container}>
      <h1 className={styles.mainTitle}>Mi Perfil</h1>
      <p className={styles.mainSubtitle}>Gestiona tu información personal, reservas y suscripciones.</p>

      <div className={styles.adminNav}>
        {userOptions.map(opt => (
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