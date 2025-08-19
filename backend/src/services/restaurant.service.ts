// service: interact with Prisma to fetch restaurants and compute avg rating
import prisma from '../prisma/client';

export type RestaurantWithRating = {
  id_restaurant: string;
  name: string;
  chair_amount: number;
  chair_available: number;
  street: string;
  height: string;
  image?: string | null;
  opening_time: Date;
  closing_time: Date;
  id_owner: string;
  id_district: string;
  status: number;
  // extras computed
  avgRating: number | null;
  reviewCount: number;
  districtName?: string | null;
};

export async function getAllRestaurantsOrderedByRating(): Promise<RestaurantWithRating[]> {
  // fetch restaurants with reservations + reviews and district relation (if present)
  const restaurants = await prisma.restaurant.findMany({
    include: {
      // include reservations so we can access reviews via reservation.review
      reservation: {
        include: {
          review: true,
        },
      },
      // include district relation if exists in schema (we will read possible display name)
      district: true,
    },
  });

  // compute average rating for each restaurant
  const computed = restaurants.map((r) => {
    // collect all reviews under all reservations
    const reviews = (r.reservation ?? []).flatMap((res) => res.review ?? []);
    const ratings = reviews.map((rv) => rv.rating).filter((v) => typeof v === 'number');
    const reviewCount = ratings.length;
    const avgRating = reviewCount > 0 ? ratings.reduce((a, b) => a + b, 0) / reviewCount : null;

    // try to get a human-friendly district name (fallback to id_district)
    // using optional chaining: district may have different fields; pick common ones.
    const district = (r as any).district;
    let districtName: string | null = null;
    if (district) {
      districtName = district.name ?? district.district_name ?? district.description ?? null;
    }

    return {
      id_restaurant: r.id_restaurant,
      name: r.name,
      chair_amount: r.chair_amount,
      chair_available: r.chair_available,
      street: r.street,
      height: r.height,
      image: r.image ?? null,
      opening_time: r.opening_time,
      closing_time: r.closing_time,
      id_owner: r.id_owner,
      id_district: r.id_district,
      status: r.status,
      avgRating,
      reviewCount,
      districtName,
    } as RestaurantWithRating;
  });

  // sort by avgRating desc (nulls treated as 0 to push them to the end)
  computed.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

  return computed;
}
