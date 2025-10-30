import React, { useMemo } from 'react';
import type { ReservationStatus } from '../types/reservation';
import styles from './ReservationStatusActions.module.css';
interface ReservationStatusActionsProps {
  status: ReservationStatus;
  disabled?: boolean;
  onChange: (status: ReservationStatus) => void;
}
type ActionTone = 'positive' | 'negative' | 'info' | 'neutral' | 'warning';
interface StatusAction {
  label: string;
  value: ReservationStatus;
  tone: ActionTone;
}
const ACTIONS_BY_STATUS: Record<ReservationStatus, StatusAction[]> = {
  pendiente: [
    { label: 'Aceptar', value: 'aceptada', tone: 'positive' },
    { label: 'Rechazar', value: 'rechazada', tone: 'negative' },
    { label: 'Cancelar', value: 'cancelada', tone: 'warning' },
  ],
  aceptada: [
    { label: 'Marcar asistencia', value: 'asistencia', tone: 'info' },
    { label: 'Marcar ausencia', value: 'ausencia', tone: 'neutral' },
    { label: 'Cancelar', value: 'cancelada', tone: 'warning' },
  ],
  rechazada: [
    { label: 'Aceptar', value: 'aceptada', tone: 'positive' },
    { label: 'Volver a pendiente', value: 'pendiente', tone: 'warning' },
  ],
  superada: [
    { label: 'Marcar asistencia', value: 'asistencia', tone: 'info' },
    { label: 'Marcar ausencia', value: 'ausencia', tone: 'neutral' },
  ],
  asistencia: [
    { label: 'Marcar ausencia', value: 'ausencia', tone: 'neutral' },
  ],
  ausencia: [
    { label: 'Marcar asistencia', value: 'asistencia', tone: 'info' },
  ],
  cancelada: [
    { label: 'Aceptar', value: 'aceptada', tone: 'positive' },
    { label: 'Volver a pendiente', value: 'pendiente', tone: 'warning' },
  ],
};
const ReservationStatusActions: React.FC<ReservationStatusActionsProps> = ({ status, disabled = false, onChange }) => {
  const actions = useMemo(() => ACTIONS_BY_STATUS[status] ?? [], [status]);
  if (actions.length === 0) {
    return <span className={styles.noActions}>Sin acciones disponibles</span>;
  }
  return (
    <div className={styles.actions}>
      {actions.map(action => (
        <button
          key={action.value}
          type="button"
          className={`${styles.button} ${styles[action.tone]}`}
          onClick={() => onChange(action.value)}
          disabled={disabled}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};
export default ReservationStatusActions;