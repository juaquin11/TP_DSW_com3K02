export type Dish = {
    dish_name: string;
    description: string;
    current_price: number;
    id_restaurant: string;
    image?: string | null;
    status: number;
};