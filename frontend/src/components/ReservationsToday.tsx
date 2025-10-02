import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// import { fetchReservationsForToday } from '../services/reservationService'; // <-- A futuro
// import type { Reservation } from '../types/reservation'; // <-- A futuro
import styles from './ReservationsToday.module.css';

// --- DATOS DE EJEMPLO (mientras construimos el backend) ---
const mockReservations = [
  { id: '1', clientName: 'Martín García', time: '20:00', diners: 4, status: 'pendiente' },
  { id: '2', clientName: 'Paola Herrera', time: '20:30', diners: 2, status: 'aceptada' },
  { id: '3', clientName: 'Lucas Gimenez', time: '12:30', diners: 3, status: 'superada' },
  { id: '4', clientName: 'Florencia Lopez', time: '21:00', diners: 2, status: 'pendiente' },
  { id: '5', clientName: 'Javier Castro', time: '13:00', diners: 5, status: 'rechazada' },
];
// ---------------------------------------------------------


interface Props {
  restaurantId: string;
}

const ReservationsToday: React.FC<Props> = ({ restaurantId }) => {
  const [reservations, setReservations] = useState(mockReservations);
  const [filter, setFilter] = useState('todas');
  const { token } = useAuth();

  // Lógica para filtrar las reservas
  const filteredReservations = reservations.filter(r => {
    if (filter === 'todas') return true;
    return r.status === filter;
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    // Aquí iría la llamada a la API para actualizar el estado
    console.log(`Cambiando reserva ${id} a estado ${newStatus}`);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Reservas para Hoy</h2>
      <div className={styles.filterContainer}>
        <button onClick={() => setFilter('todas')} className={filter === 'todas' ? styles.active : ''}>Todas</button>
        <button onClick={() => setFilter('pendiente')} className={filter === 'pendiente' ? styles.active : ''}>Pendientes</button>
        <button onClick={() => setFilter('aceptada')} className={filter === 'aceptada' ? styles.active : ''}>Aceptadas</button>
        <button onClick={() => setFilter('rechazada')} className={filter === 'rechazada' ? styles.active : ''}>Rechazadas</button>
        <button onClick={() => setFilter('superada')} className={filter === 'superada' ? styles.active : ''}>Superadas</button>
      </div>

      <div className={styles.tableContainer}>
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
                  {res.status === 'pendiente' && (
                    <>
                      <button onClick={() => handleUpdateStatus(res.id, 'aceptada')} className={`${styles.btn} ${styles.btnAccept}`}>Aceptar</button>
                      <button onClick={() => handleUpdateStatus(res.id, 'rechazada')} className={`${styles.btn} ${styles.btnReject}`}>Rechazar</button>
                    </>
                  )}
                  {res.status === 'superada' && (
                     <button onClick={() => handleUpdateStatus(res.id, 'ausente')} className={`${styles.btn} ${styles.btnAbsent}`}>Marcar Ausencia</button>
                  )}
                   {res.status === 'aceptada' && (
                     <button onClick={() => handleUpdateStatus(res.id, 'asistencia')} className={`${styles.btn} ${styles.btnAssist}`}>Marcar Asistencia</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsToday;