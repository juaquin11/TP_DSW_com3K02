// frontend/src/components/ReservationsToday.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchReservationsForToday, updateReservationStatus } from '../services/reservationService';
import type { Reservation, ReservationStatus } from '../types/reservation';
import styles from './ReservationsToday.module.css';
import ReservationStatusActions from './ReservationStatusActions';

interface Props {
  restaurantId: string;
}

const ReservationsToday: React.FC<Props> = ({ restaurantId }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { token } = useAuth();
  const { success, error: showError } = useToast();

  const loadReservations = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetchReservationsForToday(restaurantId, token);
      setReservations(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar las reservas:", err);
      setError("No se pudieron cargar las reservas. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, token]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleUpdateStatus = async (id: string, newStatus: ReservationStatus) => {
    if (!token) return;
    setUpdatingId(id);
    const previous = reservations.map(r => ({ ...r }));
    try {
      // Actualiza el estado visualmente de forma optimista
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      await updateReservationStatus(id, newStatus, token);
      success('Estado de la reserva actualizado correctamente.');
    } catch (err: any) {
      console.error("Error al actualizar el estado:", err);
      showError(err?.response?.data?.error || "No se pudo actualizar la reserva.");
      setReservations(previous);
    }finally {
      setUpdatingId(null);
    }
  };

  const filteredReservations = reservations.filter(r => {
    if (filter === 'todas') return true;
    return r.status === filter;
  });

  if (loading) return <p>Cargando reservas...</p>;
  if (error) return <p style={{ color: '#d9534f' }}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Reservas para Hoy</h2>
      <div className={styles.filterContainer}>
        {/* ... (los botones de filtro no cambian) ... */}
        <button onClick={() => setFilter('todas')} className={filter === 'todas' ? styles.active : ''}>Todas</button>
        <button onClick={() => setFilter('pendiente')} className={filter === 'pendiente' ? styles.active : ''}>Pendientes</button>
        <button onClick={() => setFilter('aceptada')} className={filter === 'aceptada' ? styles.active : ''}>Aceptadas</button>
        <button onClick={() => setFilter('rechazada')} className={filter === 'rechazada' ? styles.active : ''}>Rechazadas</button>
        <button onClick={() => setFilter('superada')} className={filter === 'superada' ? styles.active : ''}>Superadas</button>
        <button onClick={() => setFilter('cancelada')} className={filter === 'cancelada' ? styles.active : ''}>Canceladas</button> 
      </div>

      <div className={styles.tableContainer}>
        {filteredReservations.length > 0 ? (
          <table className={styles.table}>
            <thead>
            <tr>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
            <tbody>
              {filteredReservations.map(res => (
                <tr key={res.id}>
                  <td>{res.time}</td>
                  <td>{res.clientName}</td>
                  <td>{res.diners}</td>
                  <td><span className={`${styles.status} ${styles[res.status]}`}>{res.status.replace('_', ' ')}</span></td>
                  <td className={styles.actions}>
                    <ReservationStatusActions
                      status={res.status}
                      disabled={updatingId === res.id}
                      onChange={nextStatus => handleUpdateStatus(res.id, nextStatus)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay reservas que coincidan con el filtro seleccionado.</p>
        )}
      </div>
    </div>
  );
};

export default ReservationsToday;
