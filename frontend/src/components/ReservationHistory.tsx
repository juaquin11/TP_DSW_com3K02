import React, { useEffect, useState } from 'react';
import styles from './ReservationHistory.module.css';
import type { Reservation, ReservationStatus } from '../types/reservation';
import { getUpcomingReservations, updateReservationStatus } from '../services/reservationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ReservationStatusActions from './ReservationStatusActions';

interface Props {
  idRestaurant: string;
}

const HISTORY_STATUSES: ReservationStatus[] = [
  'aceptada',
  'rechazada',
  'asistencia',
  'ausencia',
  'cancelada',
];

const filterHistoryReservations = (reservations: Reservation[]) =>
  reservations.filter(reservation => HISTORY_STATUSES.includes(reservation.status));

const applyFiltersToData = (
  data: Reservation[],
  status: ReservationStatus | '',
  date: string
) => {
  let filteredData = [...data];
  
  if (status) {
    filteredData = filteredData.filter(reservation => reservation.status === status);
  }

  if (date) {
    filteredData = filteredData.filter(reservation => {
      const reservationDate = new Date(reservation.time);
      const year = reservationDate.getFullYear();
      const month = String(reservationDate.getMonth() + 1).padStart(2, '0');
      const day = String(reservationDate.getDate()).padStart(2, '0');
      const dateOnly = `${year}-${month}-${day}`;
      return dateOnly === date;
    });
  }

  return filteredData;
};

const ReservationHistory: React.FC<Props> = ({ idRestaurant }) => {
  const { token } = useAuth();
  const { success, error: showError } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filtered, setFiltered] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getUpcomingReservations(idRestaurant, token);
        const sanitized = filterHistoryReservations(data);
        setReservations(sanitized);
        setFiltered(sanitized);
      } catch (err: any) {
        console.error('Error al obtener reservas:', err);
        setError(err?.response?.data?.error || 'Error al cargar las reservas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, [idRestaurant, token]);

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ReservationStatus | '';
    setStatusFilter(value);
    setFiltered(applyFiltersToData(reservations, value, dateFilter));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateFilter(value);
    setFiltered(applyFiltersToData(reservations, statusFilter, value));
  };

  const handleStatusUpdate = async (id: string, newStatus: ReservationStatus) => {
    if (!token) return;

    const previousReservations = reservations.map(r => ({ ...r }));
    const previousFiltered = filtered.map(r => ({ ...r }));
    setUpdatingId(id);
    
    // Actualización optimista
    setReservations(prev => {
      const updated = prev
        .map(reservation => (reservation.id === id ? { ...reservation, status: newStatus } : reservation))
        .filter(reservation => HISTORY_STATUSES.includes(reservation.status));
      setFiltered(applyFiltersToData(updated, statusFilter, dateFilter));
      return updated;
    });

    try {
      await updateReservationStatus(id, newStatus, token);
      success('Estado actualizado correctamente.');
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      setReservations(previousReservations);
      setFiltered(previousFiltered);
      showError(error?.response?.data?.error || 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setFiltered(reservations);
  };

  const statusLabels: Record<ReservationStatus, string> = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    asistencia: 'Asistencia',
    ausencia: 'Ausencia',
    cancelada: 'Cancelada',
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    
    // Formatear fecha: DD/MM/YYYY
    const dateStr = date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    // Formatear hora: HH:mm
    const timeStr = date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    // Formatear día de la semana
    const dayOfWeek = date.toLocaleDateString('es-AR', { 
      weekday: 'long' 
    });
    
    return { date: dateStr, time: timeStr, dayOfWeek };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.spinner}></div>
          <p>Cargando reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Estado</label>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            {HISTORY_STATUSES.map(status => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Fecha</label>
          <input
            type="date"
            value={dateFilter}
            onChange={handleDateChange}
            className={styles.datePicker}
          />
        </div>

        <button onClick={clearFilters} className={styles.clearButton}>
          Limpiar Filtros
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className={styles.cardContainer}>
          {filtered.map((r) => {
            const { date, time, dayOfWeek } = formatDateTime(r.time);
            return (
              <div key={r.id} className={styles.card} data-status={r.status}>
                <div className={styles.cardHeader}>
                  <h4 className={styles.clientName}>{r.clientName}</h4>
                  <span className={`${styles.statusBadge} ${styles[r.status]}`}>
                    {statusLabels[r.status]}
                  </span>
                </div>

                <div className={styles.info}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Día:</span>
                    <span className={styles.infoValue}>{dayOfWeek}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Fecha:</span>
                    <span className={styles.infoValue}>{date}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Hora:</span>
                    <span className={styles.infoValue}>{time}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Comensales:</span>
                    <span className={styles.infoValue}>{r.diners}</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <span className={styles.actionsLabel}>Gestionar estado</span>
                  <ReservationStatusActions
                    status={r.status}
                    disabled={updatingId === r.id}
                    onChange={nextStatus => handleStatusUpdate(r.id, nextStatus)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <h3>No hay reservas</h3>
          <p>No se encontraron reservas con los filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;