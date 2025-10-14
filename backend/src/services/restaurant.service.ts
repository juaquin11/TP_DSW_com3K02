import prisma from '../prisma/client';
import { Prisma } from '../generated/prisma';
import {
  RestaurantWithRating,
  OwnerRestaurant,
  CreateRestaurantPayload,
  RestaurantWithDiscounts,
  RestaurantSearchMatch,
  RestaurantSearchParams,
  RestaurantSearchResult,
  RestaurantSearchSuggestions,
} from '../models/types';


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

export async function getRestaurantsWithSubscriptionDiscounts(): Promise<RestaurantWithDiscounts[]> {
  const result = await prisma.$queryRaw<RestaurantWithDiscounts[]>(Prisma.sql`
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
      COUNT(DISTINCT rev.review_number) AS reviewCount,
      (
        SELECT GROUP_CONCAT(DISTINCT s.plan_name ORDER BY s.plan_name SEPARATOR ', ')
        FROM dish_subscription AS ds
        INNER JOIN subscription AS s ON ds.id_subscription = s.id_subscription
        WHERE ds.id_restaurant = r.id_restaurant AND ds.discount > 0
      ) AS subscriptionNames
    FROM restaurant AS r
    LEFT JOIN district AS d ON r.id_district = d.id_district
    LEFT JOIN reservation AS res ON r.id_restaurant = res.id_restaurant
    LEFT JOIN review AS rev ON res.id_reservation = rev.id_reservation
    GROUP BY r.id_restaurant, r.name, r.chair_amount, r.chair_available, 
             r.street, r.height, r.image, r.opening_time, r.closing_time,
             r.id_owner, r.id_district, r.status, d.name
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

type RawSearchRow = {
  id_restaurant: string;
  name: string;
  chair_amount: number;
  chair_available: number;
  street: string;
  height: string;
  image: string | null;
  opening_time: string;
  closing_time: string;
  id_owner: string;
  id_district: string;
  status: number;
  districtName: string | null;
  avgRating: any;
  reviewCount: any;
  isRestaurantMatch: any;
  matchedCategoryNames: string | null;
  matchedDishNames: string | null;
  matchPriority: any;
};

const parseGroupedList = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter((item, index, array) => item.length > 0 && array.indexOf(item) === index);
};

const buildSuggestions = (
  restaurants: { name: string }[],
  categories: { name: string }[],
  dishes: { dish_name: string }[],
): RestaurantSearchSuggestions => ({
  restaurants: restaurants.map(item => item.name).filter(Boolean),
  categories: categories.map(item => item.name).filter(Boolean),
  dishes: dishes.map(item => item.dish_name).filter(Boolean),
});

export async function searchRestaurants({
  query,
  limit,
  suggestionsLimit,
  includeResults,
}: RestaurantSearchParams): Promise<RestaurantSearchResult> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return {
      query,
      results: [],
      suggestions: { restaurants: [], categories: [], dishes: [] },
    };
  }

  const likeQuery = `%${normalizedQuery}%`;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(50, Math.floor(limit))) : 12;
  const safeSuggestionsLimit = Number.isFinite(suggestionsLimit)
    ? Math.max(1, Math.min(12, Math.floor(suggestionsLimit)))
    : 6;

  let rawRows: RawSearchRow[] = [];

  if (includeResults) {
    rawRows = await prisma.$queryRaw<RawSearchRow[]>(Prisma.sql`
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
        COUNT(rev.rating) AS reviewCount,
        MAX(CASE WHEN LOWER(r.name) LIKE ${likeQuery} THEN 1 ELSE 0 END) AS isRestaurantMatch,
        GROUP_CONCAT(DISTINCT CASE WHEN LOWER(cat.name) LIKE ${likeQuery} THEN cat.name END) AS matchedCategoryNames,
        GROUP_CONCAT(DISTINCT CASE WHEN LOWER(dish.dish_name) LIKE ${likeQuery} THEN dish.dish_name END) AS matchedDishNames,
        MAX(
          CASE
            WHEN LOWER(r.name) LIKE ${likeQuery} THEN 3
            WHEN LOWER(cat.name) LIKE ${likeQuery} THEN 2
            WHEN LOWER(dish.dish_name) LIKE ${likeQuery} THEN 1
            ELSE 0
          END
        ) AS matchPriority
      FROM restaurant AS r
      LEFT JOIN district AS d ON r.id_district = d.id_district
      LEFT JOIN restaurant_category AS rc ON r.id_restaurant = rc.id_restaurant
      LEFT JOIN category AS cat ON rc.id_category = cat.id_category
      LEFT JOIN dish AS dish ON r.id_restaurant = dish.id_restaurant
      LEFT JOIN reservation AS res ON r.id_restaurant = res.id_restaurant
      LEFT JOIN review AS rev ON res.id_reservation = rev.id_reservation
      WHERE r.status = 1
        AND (
          LOWER(r.name) LIKE ${likeQuery}
          OR LOWER(cat.name) LIKE ${likeQuery}
          OR LOWER(dish.dish_name) LIKE ${likeQuery}
        )
      GROUP BY r.id_restaurant
      ORDER BY matchPriority DESC, avgRating DESC
      LIMIT ${safeLimit}
    `);
  }

  const [restaurantNames, categoryNames, dishNames] = await Promise.all([
    prisma.$queryRaw<{ name: string }[]>(Prisma.sql`
      SELECT DISTINCT r.name AS name
      FROM restaurant AS r
      WHERE r.status = 1 AND LOWER(r.name) LIKE ${likeQuery}
      ORDER BY LOCATE(${normalizedQuery}, LOWER(r.name)), r.name
      LIMIT ${safeSuggestionsLimit}
    `),
    prisma.$queryRaw<{ name: string }[]>(Prisma.sql`
      SELECT DISTINCT c.name AS name
      FROM category AS c
      INNER JOIN restaurant_category AS rc ON rc.id_category = c.id_category
      INNER JOIN restaurant AS r ON r.id_restaurant = rc.id_restaurant
      WHERE r.status = 1 AND LOWER(c.name) LIKE ${likeQuery}
      ORDER BY LOCATE(${normalizedQuery}, LOWER(c.name)), c.name
      LIMIT ${safeSuggestionsLimit}
    `),
    prisma.$queryRaw<{ dish_name: string }[]>(Prisma.sql`
      SELECT DISTINCT d.dish_name
      FROM dish AS d
      INNER JOIN restaurant AS r ON r.id_restaurant = d.id_restaurant
      WHERE r.status = 1 AND LOWER(d.dish_name) LIKE ${likeQuery}
      ORDER BY LOCATE(${normalizedQuery}, LOWER(d.dish_name)), d.dish_name
      LIMIT ${safeSuggestionsLimit}
    `),
  ]);

  const suggestions = buildSuggestions(restaurantNames, categoryNames, dishNames);

  const results: RestaurantSearchMatch[] = includeResults
    ? rawRows.map(row => {
        const matchedCategories = parseGroupedList(row.matchedCategoryNames);
        const matchedDishes = parseGroupedList(row.matchedDishNames);

        const reasons: string[] = [];
        if (Number(row.isRestaurantMatch)) {
          reasons.push('Coincide con el nombre');
        }
        if (matchedCategories.length > 0) {
          reasons.push(`Categoría: ${matchedCategories[0]}`);
        }
        if (matchedDishes.length > 0) {
          reasons.push(`Plato: ${matchedDishes[0]}`);
        }

        const matchSummary = reasons.length > 0 ? reasons.join(' • ') : 'Coincidencia encontrada';

        const mapped: RestaurantSearchMatch = {
          id_restaurant: row.id_restaurant,
          name: row.name,
          chair_amount: row.chair_amount,
          chair_available: row.chair_available,
          street: row.street,
          height: row.height,
          image: row.image,
          opening_time: String(row.opening_time),
          closing_time: String(row.closing_time),
          id_owner: row.id_owner,
          id_district: row.id_district,
          status: row.status,
          districtName: row.districtName,
          avgRating: row.avgRating !== null ? Number(row.avgRating) : null,
          reviewCount: Number(row.reviewCount),
          matchPriority: Number(row.matchPriority ?? 0),
          matchedCategories,
          matchedDishes,
          matchSummary,
        };

        return mapped;
      })
    : [];

  return {
    query,
    results,
    suggestions,
  };
}