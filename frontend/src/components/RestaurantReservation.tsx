import React, { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { createReservation } from '../services/reservationService';
import styles from './RestaurantReservation.module.css';

interface Props {
  restaurantId: string;
  openingTime?: string;
  closingTime?: string;
  onClose?: () => void;
}

const TIME_STEP_MINUTES = 30;

const normalizeTime = (time: string) => time.slice(0, 5);

const timeToMinutes = (time: string): number => {
  const [hoursStr = '0', minutesStr = '0'] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
};

interface TimeSlot {
  value: string;
  absoluteMinutes: number;
}

const normalizeMinutesOfDay = (minutes: number): number => {
  const minutesPerDay = 24 * 60;
  const normalized = minutes % minutesPerDay;
  return normalized >= 0 ? normalized : normalized + minutesPerDay;
}

const formatMinutes = (minutes: number) => {
  const minutesOfDay = normalizeMinutesOfDay(minutes);
  const hours = Math.floor(minutesOfDay / 60);
  const mins = minutesOfDay % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

const generateTimeSlots = (openingTime: string, closingTime: string): TimeSlot[] => {
  const startMinutes = timeToMinutes(openingTime);
  let endMinutes = timeToMinutes(closingTime);

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const slots: TimeSlot[] = [];
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += TIME_STEP_MINUTES) {
    const formatted = formatMinutes(minutes);
    if (!slots.some(slot => slot.value === formatted)) {
      slots.push({ value: formatted, absoluteMinutes: minutes });
    }
  }  

  const closingFormatted = formatMinutes(endMinutes);
  if (!slots.some(slot => slot.value === closingFormatted)) {
      slots.push({ value: closingFormatted, absoluteMinutes: endMinutes });
    }
    
  return slots.sort((a, b) => a.absoluteMinutes - b.absoluteMinutes);
  };

const RestaurantReservation: React.FC<Props> = ({ restaurantId, openingTime, closingTime, onClose }) => {
  const { token, user } = useAuth();
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [diners, setDiners] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveOpeningTime = openingTime ?? '00:00';
  const effectiveClosingTime = closingTime ?? '23:30';

  const todayString = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

const allTimeSlots = useMemo(
    () => generateTimeSlots(effectiveOpeningTime, effectiveClosingTime),
    [effectiveOpeningTime, effectiveClosingTime]);

  const availableTimeSlots = useMemo(() => {
    if (!reservationDate) {
      return allTimeSlots;
    }

    const today = new Date();
    const selectedDate = new Date(`${reservationDate}T00:00`);

    if (selectedDate.toDateString() !== today.toDateString()) {
      return allTimeSlots;
    }

    const currentMinutes = today.getHours() * 60 + today.getMinutes();
    return allTimeSlots.filter((slot) => slot.absoluteMinutes > currentMinutes);
  }, [allTimeSlots, reservationDate]);

  useEffect(() => {
    if (reservationTime && !availableTimeSlots.some(slot => slot.value === reservationTime)) {
      setReservationTime('');
    }
  }, [availableTimeSlots, reservationTime]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!token || user?.type !== 'client') {
      setErrorMessage('Debes iniciar sesión como cliente para reservar.');
      return;
    }

    if (!reservationDate) {
      setErrorMessage('Selecciona la fecha de la reserva.');
      return;
    }

    if (!reservationTime) {
      setErrorMessage('Selecciona un horario disponible.');
      return;
    }

    if (!Number.isInteger(diners) || diners <= 0) {
      setErrorMessage('La cantidad de comensales debe ser un número entero mayor a cero.');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedSlot = allTimeSlots.find(slot => slot.value === reservationTime);
      
      if (!selectedSlot) {
        setErrorMessage('Selecciona un horario válido.');
        return;
      }

      const [yearStr, monthStr, dayStr] = reservationDate.split('-');
      const reservationDateObj = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
      
      if (Number.isNaN(reservationDateObj.getTime())) {
        setErrorMessage('La fecha seleccionada no es válida.');
        return;
      }

      if (selectedSlot.absoluteMinutes >= 24 * 60) {
        reservationDateObj.setDate(reservationDateObj.getDate() + 1);
      }

      const adjustedDate = [
        reservationDateObj.getFullYear(),
        String(reservationDateObj.getMonth() + 1).padStart(2, '0'),
        String(reservationDateObj.getDate()).padStart(2, '0'),
      ].join('-');

      const reservationDateTime = `${adjustedDate}T${reservationTime}`;
      await createReservation(restaurantId, reservationDateTime, diners, token);
      setSuccessMessage('¡Reserva creada con éxito! Te contactaremos para confirmar.');
      setReservationDate('');
      setReservationTime('');
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
      <p className={styles.hint}>
        {openingTime && closingTime
          ? `El restaurante atiende de ${normalizeTime(openingTime)} a ${normalizeTime(closingTime)}. Selecciona una fecha y uno de los horarios disponibles.`
          : 'Selecciona una fecha y uno de los horarios disponibles.'}
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="reservationDate">
              Fecha
            </label>
            <input
              id="reservationDate"
              type="date"
              min={todayString}
              value={reservationDate}
              onChange={event => setReservationDate(event.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="reservationTime">
              Horario
            </label>
            <select
              id="reservationTime"
              value={reservationTime}
              onChange={event => setReservationTime(event.target.value)}
              className={styles.select}
              disabled={availableTimeSlots.length === 0}
              required
            >
              <option value="" disabled>
                {availableTimeSlots.length > 0 ? 'Selecciona un horario' : 'Sin horarios disponibles'}
              </option>
              {availableTimeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.value}
                </option>
              ))}
            </select>
          </div>
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
        {reservationDate && availableTimeSlots.length === 0 && (
          <p className={`${styles.feedback} ${styles.info}`}>
            Todos los horarios del día seleccionado ya pasaron. Elige otra fecha para continuar.
          </p>
        )}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || (reservationDate !== '' && availableTimeSlots.length === 0)}
          >
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