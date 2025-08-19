import React from 'react';
import type { RestaurantDTO } from '../types/restaurant';
type Props = {
  restaurant: RestaurantDTO;
};

const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  const {
    name,
    image,
    street,
    height,
    districtName,
    chair_available,
    chair_amount,
    avgRating,
    reviewCount,
    opening_time,
    closing_time,
  } = restaurant;

  // If image is null, use a placeholder (Unsplash)
  const imageUrl =
    image ||
    `https://source.unsplash.com/collection/190727/600x400?sig=${encodeURIComponent(
      restaurant.id_restaurant
    )}`;

  // Format times (backend returns strings)
  const opening = opening_time ? new Date(opening_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const closing = closing_time ? new Date(closing_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <article className="restaurant-card" aria-label={`Restaurant ${name}`}>
      <img src={imageUrl} alt={`Image of ${name}`} className="restaurant-image" />
      <div className="restaurant-body">
        <h3 className="restaurant-name">{name}</h3>
        <p className="restaurant-meta">
          {districtName ?? restaurant.id_district} · {street} {height}
        </p>
        <p className="restaurant-seats">
          Seats: {chair_available}/{chair_amount}
        </p>
        <p className="restaurant-hours">
          Hours: {opening} — {closing}
        </p>
        <p className="restaurant-rating">
          Rating: {avgRating ? avgRating.toFixed(1) : '—'} {reviewCount ? `(${reviewCount})` : ''}
        </p>
      </div>
    </article>
  );
};

export default RestaurantCard;
