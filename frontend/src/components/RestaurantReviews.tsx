import React, { useEffect, useState } from 'react';
import { fetchReviewsByRestaurant } from '../services/reviewService';
import type { ReviewDTO } from '../types/review';
import styles from './RestaurantReviews.module.css';

interface Props {
  restaurantId: string;
}

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const RestaurantReviews: React.FC<Props> = ({ restaurantId }) => {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await fetchReviewsByRestaurant(restaurantId);
        setReviews(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar reseñas:', err);
        setError('No se pudieron cargar las reseñas.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [restaurantId]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : reviews.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < reviews.length - 1 ? prev + 1 : 0));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ));
  };

  const getInitials = (name: string): string => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Reseñas de Clientes</h3>
        <p className={styles.loading}>Cargando reseñas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Reseñas de Clientes</h3>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Reseñas de Clientes</h3>
        <p className={styles.noReviews}>
          Este restaurante aún no tiene reseñas.
        </p>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Reseñas de Clientes</h3>
      
      <div className={styles.reviewCard}>
        <div className={styles.reviewHeader}>
          <div className={styles.clientInfo}>
            <div className={styles.avatar}>
              {getInitials(currentReview.client_name)}
            </div>
            <div className={styles.clientDetails}>
              <h4 className={styles.clientName}>{currentReview.client_name}</h4>
              <p className={styles.reservationInfo}>
                Reservó para {currentReview.diners} {currentReview.diners === 1 ? 'persona' : 'personas'}
              </p>
            </div>
          </div>
          <div className={styles.dateContainer}>
            <p className={styles.date}>{formatDate(currentReview.reservation_date)}</p>
          </div>
        </div>

        <div className={styles.rating}>
          {renderStars(currentReview.rating)}
          <span className={styles.ratingNumber}>{currentReview.rating}/5</span>
        </div>

        <div className={styles.commentContainer}>
          {currentReview.comment ? (
            <p className={styles.comment}>"{currentReview.comment}"</p>
          ) : (
            <p className={styles.noComment}>El cliente no dejó comentarios adicionales.</p>
          )}
        </div>

        {reviews.length > 1 && (
          <div className={styles.navigation}>
            <button 
              onClick={handlePrevious} 
              className={styles.navButton}
              aria-label="Reseña anterior"
            >
              <ChevronLeftIcon />
            </button>
            <span className={styles.counter}>
              {currentIndex + 1} de {reviews.length}
            </span>
            <button 
              onClick={handleNext} 
              className={styles.navButton}
              aria-label="Siguiente reseña"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantReviews;