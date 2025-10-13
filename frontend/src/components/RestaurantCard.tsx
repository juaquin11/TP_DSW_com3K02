import React from "react";
import styles from "./RestaurantCard.module.css";
import { API_BASE_URL } from "../services/apiClient"; 

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">` +
      `<defs>` +
        `<linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">` +
          `<stop offset="0%" stop-color="#2d2d2d"/>` +
          `<stop offset="100%" stop-color="#1a1a1a"/>` +
        `</linearGradient>` +
      `</defs>` +
      `<rect fill="url(#grad)" width="400" height="240"/>` +
      `<text x="50%" y="50%" fill="#f5f3e7" font-size="22" font-family="Segoe UI, Arial" font-weight="600" dominant-baseline="middle" text-anchor="middle">Restaurante</text>` +
    `</svg>`
  );

type BadgeVariant = 'gold' | 'plum' | 'emerald' | 'rose';

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  street: string;
  height: string;
  rating: number;
  subscriptionNames?: string | null;
  onClick?: (id: string) => void;
  badgeLabel?: string;
  badgeVariant?: BadgeVariant;
  highlightText?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  image,
  street,
  height,
  rating,
  subscriptionNames,
  onClick,
  badgeLabel,
  badgeVariant = 'gold',
  highlightText,
}) => {
  const imageUrl = image ? `${API_BASE_URL}${image}` : FALLBACK_IMAGE;

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
      <div className={styles.imageWrapper}>
        {badgeLabel && (
          <span className={`${styles.badge} ${styles[`badge${badgeVariant.charAt(0).toUpperCase() + badgeVariant.slice(1)}`]}`}>
            {badgeLabel}
          </span>
        )}
        <img src={imageUrl} alt={name} className={styles.image} />
      </div>
      <div className={styles.info}>
        <div className={styles.infoMain}>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.address}>{street} {height}</p>
          <div className={styles.rating}>
            <span className={styles.ratingStar}>★</span>
            <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            {highlightText && <span className={styles.ratingHighlight}>{highlightText}</span>}
          </div>
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