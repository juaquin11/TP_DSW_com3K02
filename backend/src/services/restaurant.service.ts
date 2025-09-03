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