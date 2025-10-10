import prisma from '../prisma/client';
import { Prisma } from '../generated/prisma';
import { ReviewWithDetails } from '../models/types';

export async function getRecentReviewsByRestaurant(
  restaurantId: string,
): Promise<ReviewWithDetails[]> {
  const result = await prisma.$queryRaw<ReviewWithDetails[]>(Prisma.sql`
    SELECT 
      rev.review_number,
      rev.rating,
      rev.comment,
      DATE_FORMAT(res.reservation_date, '%Y-%m-%d %H:%i:%s') AS reservation_date,
      res.diners,
      u.name AS client_name,
      u.email AS client_email
    FROM review AS rev
    INNER JOIN reservation AS res ON rev.id_reservation = res.id_reservation
    INNER JOIN useraccount AS u ON res.id_client = u.id_user
    WHERE res.id_restaurant = ${restaurantId}
    ORDER BY res.reservation_date DESC
    LIMIT 15;
  `);

  return result;
}