import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import ConfirmToast from '../components/ConfirmToast';
import type { ToastMessage, ToastContextType, ToastType, ConfirmMessage } from '../types/toast';
import styles from './ToastContext.module.css';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirms, setConfirms] = useState<ConfirmMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeConfirm = useCallback((id: string) => {
    setConfirms((prev) => prev.filter((confirm) => confirm.id !== id));
  }, []);

  const confirm = useCallback((
    message: string, 
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string }
  ) => {
    const id = Date.now().toString();
    setConfirms((prev) => [...prev, { 
      id, 
      message, 
      onConfirm: () => {
        onConfirm();
        removeConfirm(id);
      },
      onCancel: () => removeConfirm(id),
      confirmText: options?.confirmText,
      cancelText: options?.cancelText
    }]);
  }, [removeConfirm]);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, confirm }}>
      {children}
      <div className={styles.toastContainer}>
        {confirms.map((confirmMsg) => (
          <ConfirmToast
            key={confirmMsg.id}
            message={confirmMsg.message}
            onConfirm={confirmMsg.onConfirm}
            onCancel={confirmMsg.onCancel}
            confirmText={confirmMsg.confirmText}
            cancelText={confirmMsg.cancelText}
          />
        ))}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider');
  }
  return context;
};
