import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

interface ProfileIconProps {
  userType: 'client' | 'owner';
  hasSubscription: boolean;
  notificationCount: number;
  hasPenalty: boolean;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ userType, hasSubscription, notificationCount, hasPenalty }) => {
  const profileImage = 'login.svg';
  const notificationBadgeColor = hasPenalty ? styles.notificationBadgeRed : styles.notificationBadgeYellow;

  return (
    <div className={styles.profileContainer}>
      <Link to="/profile" className={`${styles.profileIcon} ${hasSubscription ? styles.subscribed : ''}`}>
        <img 
          src={profileImage} 
          alt={`${userType} profile`} 
          className={styles.profileImage} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          />
            {notificationCount > 0 && (
          <span className={`${styles.notificationBadge} ${notificationBadgeColor}`}>
            {notificationCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default ProfileIcon;