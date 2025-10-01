import React from "react";
import styles from "./RestaurantCard.module.css";

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
