import React from 'react';
import styles from './Navbar.module.css';

interface ProfileIconProps {
  userType: 'client' | 'owner';
  hasSubscription: boolean;
  notificationCount: number;
  hasPenalty: boolean;
  onClick?: () => void;
  isMenuOpen?: boolean;
  label?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  userType,
  hasSubscription,
  notificationCount,
  hasPenalty,
  onClick,
  isMenuOpen = false,
  label = 'Mi cuenta',
}) => {
  const profileImage = 'login.svg';
  const notificationBadgeColor = hasPenalty ? styles.notificationBadgeRed : styles.notificationBadgeYellow;

  const buttonClasses = [
    styles.profileButton,
    hasSubscription ? styles.profileButtonSubscribed : '',
    isMenuOpen ? styles.profileButtonOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = userType === 'owner' ? 'Menú de dueño' : 'Menú de cliente';

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      aria-haspopup="true"
      aria-expanded={isMenuOpen}
      aria-label={ariaLabel}
    >
      <span className={styles.profileAvatar}>
        <img
          src={profileImage}
          alt={`${userType} profile`}
          className={styles.profileImage}
        />
        {notificationCount > 0 && (
          <span className={`${styles.notificationBadge} ${notificationBadgeColor}`}>
            {notificationCount}
          </span>
        )}
      </span>
      <span className={styles.profileLabel}>{label}</span>
      <span className={`${styles.caret} ${isMenuOpen ? styles.caretOpen : ''}`} aria-hidden="true" />
    </button>
  );
};

export default ProfileIcon;