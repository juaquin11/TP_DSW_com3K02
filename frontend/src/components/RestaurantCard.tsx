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
  onClick?: (id: string) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  image,
  street,
  height,
  rating,
  onClick
}) => {

    const imageUrl = `${API_BASE_URL}${image}`;


  const handleClick = () => {
    if (onClick && id) {
      onClick(id);
    }
  };

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <img src={imageUrl} alt={name} className={styles.image} />
      <div className={styles.info}>
        <h2 className={styles.name}>{name}</h2>
        <p className={styles.address}>{street} {height}</p>
        <p className={styles.rating}>⭐ {rating}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;
