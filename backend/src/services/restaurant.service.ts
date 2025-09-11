import prisma from '../prisma/client';
import { Prisma } from '../generated/prisma';

export type RestaurantWithRating = {
  id_restaurant: string;
  name: string;
  chair_amount: number;
  chair_available: number;
  street: string;
  height: string;
  image?: string | null;
  opening_time: string;
  closing_time: string;
  id_owner: string;
  id_district: string;
  status: number;
  avgRating: number | null;
  reviewCount: number;
  districtName?: string | null;
};

export type OwnerRestaurant = {
  id_restaurant: string;
  name: string;
  chair_amount: number;
  chair_available: number;
  street: string;
  height: string;
  image?: string | null;
  opening_time: string;
  closing_time: string;
  id_owner: string;
  id_district: string;
  status: number;
  districtName?: string | null;
};


export async function getAllRestaurantsOrderedByRating(): Promise<RestaurantWithRating[]> {
  const result = await prisma.$queryRaw<RestaurantWithRating[]>(Prisma.sql`
    SELECT               -- Sql clrudo para optimizar esta busqueda concurrente
      r.id_restaurant,
      r.name,
      r.chair_amount,
      r.chair_available,
      r.street,
      r.height,
      r.image,
      TIME_FORMAT(r.opening_time, '%H:%i:%s') AS opening_time,
      TIME_FORMAT(r.closing_time, '%H:%i:%s') AS closing_time,
      r.id_owner,
      r.id_district,
      r.status,
      d.name AS districtName,
      CAST(IFNULL(AVG(rev.rating), 0) AS DECIMAL(10, 2)) AS avgRating,
      COUNT(rev.rating) AS reviewCount
    FROM restaurant AS r
    LEFT JOIN district AS d ON r.id_district = d.id_district
    LEFT JOIN reservation AS res ON r.id_restaurant = res.id_restaurant
    LEFT JOIN review AS rev ON res.id_reservation = rev.id_reservation
    GROUP BY r.id_restaurant
    ORDER BY avgRating DESC;
  `);

  return result.map(row => ({
    ...row,
    avgRating: Number(row.avgRating),
    reviewCount: Number(row.reviewCount),
    opening_time: String(row.opening_time),
    closing_time: String(row.closing_time),
  }));
}


export async function getOwnerRestaurants(ownerId: string): Promise<OwnerRestaurant[]> {
  // Simulación del cálculo de disponibilidad
  const occupiedChairs = await prisma.reservation.groupBy({
    by: ['id_restaurant'],
    where: {
      restaurant: { id_owner: ownerId },
      // Filtro para reservas activas (estado 0)
      status: 0
    },
    _sum: {
      diners: true,
    },
  });

  const restaurants = await prisma.restaurant.findMany({
    where: {
      id_owner: ownerId,
    },
    include: {
      district: true,
    },
  });

  return restaurants.map(r => {
    const occupied = occupiedChairs.find(o => o.id_restaurant === r.id_restaurant);
    return {
      id_restaurant: r.id_restaurant,
      name: r.name,
      chair_amount: r.chair_amount,
      chair_available: r.chair_amount - (occupied?._sum?.diners || 0),
      street: r.street,
      height: r.height,
      image: r.image,
      opening_time: r.opening_time.toISOString().slice(11, 19),
      closing_time: r.closing_time.toISOString().slice(11, 19),
      id_owner: r.id_owner,
      id_district: r.id_district,
      status: r.status,
      districtName: r.district?.name,
    };
  });
}
