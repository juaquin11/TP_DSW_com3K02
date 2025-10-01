import prisma from '../prisma/client';
import { Prisma } from '../generated/prisma';
import { RestaurantWithRating , OwnerRestaurant, CreateRestaurantPayload } from '../models/types';


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

export async function createRestaurant(data: CreateRestaurantPayload, ownerId: string) {
  const { id_category, ...restaurantData } = data;
  const openingTime = new Date(`1970-01-01T${data.opening_time}:00.000Z`);
  const closingTime = new Date(`1970-01-01T${data.closing_time}:00.000Z`);

  // Prisma se encargará de la transacción para crear el restaurante y sus relaciones
  return prisma.restaurant.create({
    data: {
      ...restaurantData,
      opening_time: openingTime,
      closing_time: closingTime,
      chair_amount: Number(data.chair_amount), // Aseguramos que sea un número
      id_owner: ownerId,
      chair_available: Number(data.chair_amount), // Por defecto, todas las sillas están disponibles
      status: 1, // Activo por defecto
      restaurant_category: {
        create: id_category.map(catId => ({
          category: {
            connect: { id_category: catId },
          },
        })),
      },
    },
    include: {
        restaurant_category: {
            include: {
                category: true
            }
        },
        district: true
    }
  });
}
export async function getRestaurantById(id: string): Promise<RestaurantWithRating | null> {
  const result = await prisma.$queryRaw<any[]>(Prisma.sql`
    SELECT 
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
    WHERE r.id_restaurant = ${id}
    GROUP BY r.id_restaurant;
  `);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id_restaurant: row.id_restaurant as string,
    name: row.name as string,
    chair_amount: row.chair_amount as number,
    chair_available: row.chair_available as number,
    street: row.street as string,
    height: row.height as string,
    image: row.image as string | null,
    opening_time: String(row.opening_time),
    closing_time: String(row.closing_time),
    id_owner: row.id_owner as string,
    id_district: row.id_district as string,
    status: row.status as number,
    avgRating: Number(row.avgRating),
    reviewCount: Number(row.reviewCount),
    districtName: row.districtName as string | null,
  } as RestaurantWithRating;
}