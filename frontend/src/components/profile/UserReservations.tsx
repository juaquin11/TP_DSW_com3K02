// frontend/src/components/profile/UserReservations.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { UserProfileReservation } from '../../types/user';
import styles from './UserReservations.module.css';
import ReviewModal from './ReviewModal'; 
import { postReview } from '../../services/reviewService'; 
import { useAuth } from '../../context/AuthContext'; 
import { useToast } from '../../context/ToastContext';


interface Props {
  reservations: UserProfileReservation[];
  onReviewSubmit: () => void; // 1. Añadimos la nueva prop a la interfaz
}

// Mapeo de estados numéricos a texto y clases CSS para los badges
const statusMap: { [key: number]: { text: string; className: string } } = {
  0: { text: 'Pendiente', className: 'pendiente' },
  1: { text: 'Aceptada', className: 'aceptada' },
  2: { text: 'Rechazada', className: 'rechazada' },
  3: { text: 'Asistencia', className: 'asistencia' },
  4: { text: 'Ausencia', className: 'ausencia' },
  5: { text: 'Cancelada', className: 'cancelada' },
};

const UserReservations: React.FC<Props> = ({ reservations, onReviewSubmit }) => {
  const { token } = useAuth();
  const { success, error: showError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<UserProfileReservation | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const handleOpenReviewModal = (reservation: UserProfileReservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  const handleSubmitReview = async (reservationId: string, rating: number, comment: string) => {
    if (!token) {
      showError("No estás autenticado.");
      return;
    }
    
    try {
      await postReview({ reservationId, rating, comment }, token);
      onReviewSubmit();
      success("¡Gracias por tu reseña!");
      handleCloseModal();
    } catch (err: any) {
      showError(err.response?.data?.error || "Error al enviar la reseña.");
    }
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Reservas</h2>
      {reservations.length === 0 ? (
        <p className={styles.noReservations}>Aún no tienes reservas en tu historial.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Restaurante</th>
                <th>Fecha y Hora</th>
                <th>Personas</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => {
                const statusInfo = statusMap[res.status] || { text: 'Desconocido', className: 'pendiente' };
                // Condición para mostrar el botón de reseña:
                // El estado es 'Asistencia' (3) y la reserva aún no tiene una reseña (review === null)
                const canReview = res.status === 3 && res.review === null;

                return (
                  <tr key={res.id_reservation}>
                    <td>
                      <Link to={`/restaurant/${res.restaurant.id_restaurant}`} className={styles.restaurantLink}>
                        {res.restaurant.name}
                      </Link>
                    </td>
                    <td>{formatDate(res.reservation_date)}</td>
                    <td>{res.diners}</td>
                    <td>
                      <span className={`${styles.status} ${styles[statusInfo.className]}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td>
                      {canReview && (
                        <button 
                          className={styles.reviewButton}
                          onClick={() => handleOpenReviewModal(res)}
                        >
                          Dejar Reseña
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
       {isModalOpen && selectedReservation && (
        <ReviewModal
          reservationId={selectedReservation.id_reservation}
          restaurantName={selectedReservation.restaurant.name}
          onClose={handleCloseModal}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default UserReservations;