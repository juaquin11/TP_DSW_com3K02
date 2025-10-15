import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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


type ProfileTab = 'data' | 'reservations' | 'subscription' | 'penalties';

const ProfilePage: React.FC = () => {
  const { user, token, logout, refreshUserStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('data');

  const availableTabs = useMemo(() => {
    const baseTabs: { id: ProfileTab; label: string }[] = [
      { id: 'data', label: 'Mis Datos' },
    ];

    if (user?.type === 'client') {
      baseTabs.push({ id: 'reservations', label: 'Mis Reservas' });
      baseTabs.push({ id: 'subscription', label: 'Suscripción' });
      baseTabs.push({ id: 'penalties', label: 'Penalizaciones' });
    }

    return baseTabs;
  }, [user?.type]);

  const tabSet = useMemo(() => new Set<ProfileTab>(availableTabs.map(opt => opt.id)), [availableTabs]);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get('tab') as ProfileTab | null;

    if (requestedTab && tabSet.has(requestedTab)) {
      setActiveTab(prev => (prev === requestedTab ? prev : requestedTab));
      return;
    }

    if (requestedTab && !tabSet.has(requestedTab)) {
      navigate({ pathname: location.pathname }, { replace: true });
      return;
    }

    if (!requestedTab && !tabSet.has(activeTab)) {
      setActiveTab('data');
    }
  }, [location.search, location.pathname, tabSet, navigate, activeTab]);

  const handleTabChange = (tabId: ProfileTab) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(location.search);
    if (tabId === 'data') {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }

    const search = params.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  };

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
        {availableTabs.map(opt => (
          <button
            key={opt.id}
            className={`${styles.navButton} ${activeTab === opt.id ? styles.active : ''}`}
            onClick={() => handleTabChange(opt.id)}
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