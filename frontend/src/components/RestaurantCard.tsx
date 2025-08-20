import React from "react";
import styles from "./RestaurantCard.module.css";

interface RestaurantCardProps {
  name: string;
  image: string;
  street: string;
  height: string;
  rating: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ name, image, street, height, rating }) => {
  return (
    <div className={styles.card}>
      <img src={image} alt={name} className={styles.image} />
      <div className={styles.info}>
        <h2 className={styles.name}>{name}</h2>
        <p className={styles.address}>{street} {height}</p>
        <p className={styles.rating}>⭐ {rating}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;
