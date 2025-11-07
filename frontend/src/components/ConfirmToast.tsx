import React from 'react';
import type { ConfirmToastProps } from '../types/toast';
import styles from './ConfirmToast.module.css';

const ConfirmToast: React.FC<ConfirmToastProps> = ({ 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default'
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const confirmButtonClass = `${styles.confirmButton} ${
    variant === 'danger' ? styles.danger : 
    variant === 'success' ? styles.success : 
    ''
  }`;

  return (
    <div className={styles.confirmToast}>
      <div className={styles.confirmToastContent}>
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            <button onClick={handleCancel} className={styles.cancelButton}>
              {cancelText}
            </button>
            <button onClick={handleConfirm} className={confirmButtonClass}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmToast;
