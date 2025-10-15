import React, { useState } from 'react';
import styles from './ReviewModal.module.css';

interface Props {
  reservationId: string;
  restaurantName: string;
  onClose: () => void;
  onSubmit: (reservationId: string, rating: number, comment: string) => Promise<void>;
}

const StarIcon = ({ filled, onClick }: { filled: boolean, onClick: () => void }) => (
  <span className={`${styles.star} ${filled ? styles.filled : ''}`} onClick={onClick}>
    ★
  </span>
);

const ReviewModal: React.FC<Props> = ({ reservationId, restaurantName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (rating === 0) {
      setError('Por favor, selecciona una puntuación.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(reservationId, rating, comment);
      onClose();
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar la reseña. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Valora tu experiencia en</h2>
        <h3 className={styles.restaurantName}>{restaurantName}</h3>
        
        <div className={styles.starsContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <StarIcon
              key={index}
              filled={index < (hoverRating || rating)}
              onClick={() => setRating(index + 1)}
            />
          ))}
        </div>
        
        <textarea
          className={styles.commentArea}
          placeholder="Cuéntanos más sobre tu visita (opcional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton} disabled={isLoading}>
            Cancelar
          </button>
          <button onClick={handleSave} className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;