import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { createReservation } from '../services/reservationService';
import styles from './RestaurantReservation.module.css';

interface Props {
  restaurantId: string;
  onClose?: () => void;
}

const RestaurantReservation: React.FC<Props> = ({ restaurantId, onClose }) => {
  const { token, user } = useAuth();
  const [reservationDate, setReservationDate] = useState('');
  const [diners, setDiners] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!token || user?.type !== 'client') {
      setErrorMessage('Debes iniciar sesión como cliente para reservar.');
      return;
    }

    if (!reservationDate) {
      setErrorMessage('Selecciona la fecha y hora de la reserva.');
      return;
    }

    if (!Number.isInteger(diners) || diners <= 0) {
      setErrorMessage('La cantidad de comensales debe ser un número entero mayor a cero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createReservation(restaurantId, reservationDate, diners, token);
      setSuccessMessage('¡Reserva creada con éxito! Te contactaremos para confirmar.');
      setReservationDate('');
      setDiners(1);
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.error;
        setErrorMessage(message ?? 'No se pudo crear la reserva. Intenta nuevamente.');
      } else {
        setErrorMessage('Ocurrió un error inesperado.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Reservar mesa</h4>
        {onClose && (
          <button type="button" className={styles.closeButton} onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="reservationDate">
            Fecha y hora
          </label>
          <input
            id="reservationDate"
            type="datetime-local"
            value={reservationDate}
            onChange={event => setReservationDate(event.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="diners">
            Cantidad de comensales
          </label>
          <input
            id="diners"
            type="number"
            min={1}
            value={diners}
            onChange={event => {
              const value = Number(event.target.value);
              setDiners(Number.isNaN(value) ? 0 : value);
            }}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Confirmar reserva'}
          </button>
        </div>
      </form>
      {successMessage && <p className={`${styles.feedback} ${styles.success}`}>{successMessage}</p>}
      {errorMessage && <p className={`${styles.feedback} ${styles.error}`}>{errorMessage}</p>}
    </div>
  );
};

export default RestaurantReservation;