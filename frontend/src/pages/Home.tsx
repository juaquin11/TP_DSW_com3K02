import React, { useEffect, useState } from 'react';
import { fetchRestaurants} from '../services/restaurantService';
import type { RestaurantDTO } from '../types/restaurant';
import RestaurantCard from '../components/RestaurantCard';
import styles from "./Home.module.css";

const mockRestaurants = [
  {
    name: "Emerald Eats",
    image: "Restaurant_1.webp",
    street: "Green St",
    height: "123",
    rating: 4.5,
  },
  {
    name: "Ocean Breeze",
    image: "Restaurant_2.webp",
    street: "Blue Rd",
    height: "45",
    rating: 4.7,
  },
  {
    name: "Mountain Bites",
    image: "Restaurant_3.webp",
    street: "Hill Ave",
    height: "89",
    rating: 4.2,
  },
  {
    name: "Mountain Bites",
    image: "Restaurant_3.webp",
    street: "Hill Ave",
    height: "89",
    rating: 4.2,
  },
  {
    name: "Mountain Bites",
    image: "Restaurant_3.webp",
    street: "Hill Ave",
    height: "89",
    rating: 4.2,
  },
  {
    name: "Mountain Bites",
    image: "Restaurant_3.webp",
    street: "Hill Ave",
    height: "89",
    rating: 4.2,
  },
  {
    name: "Mountain Bites",
    image: "Restaurant_3.webp",
    street: "Hill Ave",
    height: "89",
    rating: 4.2,
  },
  {
    name: "Mountain Bites",
    image: "Restaurant_3.webp",
    street: "Hill Ave",
    height: "89",
    rating: 4.2,
  },
];

const Home: React.FC = () => {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Featured Restaurants</h1>
      <div className={styles.grid}>
        {mockRestaurants.map((restaurant, index) => (
          <RestaurantCard key={index} {...restaurant} />
        ))}
      </div>
    </main>
  );
};

export default Home;
