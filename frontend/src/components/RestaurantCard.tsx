import React from "react";
import styles from "./RestaurantCard.module.css";
import { API_BASE_URL } from "../services/apiClient"; 

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  street: string;
  height: string;
  rating: number;
  subscriptionNames?: string | null;
  onClick?: (id: string) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  image,
  street,
  height,
  rating,
  subscriptionNames,
  onClick
}) => {
  const imageUrl = `${API_BASE_URL}${image}`;

  const handleClick = () => {
    if (onClick && id) {
      onClick(id);
    }
  };

  const hasDiscounts = subscriptionNames && subscriptionNames.trim().length > 0;

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <img src={imageUrl} alt={name} className={styles.image} />
      <div className={styles.info}>
        <div className={styles.infoMain}>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.address}>{street} {height}</p>
          <p className={styles.rating}>⭐ {rating}</p>
        </div>
        
        <div className={styles.infoDiscounts}>
          {hasDiscounts && (
            <div className={styles.discountBanner}>
              <span className={styles.discountIcon}></span>
              <div className={styles.discountContent}>
                <p className={styles.discountTitle}>Descuentos para:</p>
                <p className={styles.subscriptionsList}>{subscriptionNames}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;