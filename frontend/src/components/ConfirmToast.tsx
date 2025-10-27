import React from 'react';
import type { ConfirmToastProps } from '../types/toast';
import styles from './ConfirmToast.module.css';

const ConfirmToast: React.FC<ConfirmToastProps> = ({ 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className={styles.confirmToast}>
      <div className={styles.iconContainer}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4"/>
          <path d="M12 16h.01"/>
        </svg>
      </div>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button onClick={handleCancel} className={styles.cancelButton}>
            {cancelText}
          </button>
          <button onClick={handleConfirm} className={styles.confirmButton}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmToast;
