/**
 * TEST B4 - Integración: 
 * Esta desarrollado sobre el endpoint Get /api/restaurants
 * Verifica el ciclo completo request , router , controller , respuesta HTTP,
 * usando supertest que simula llamadas HTTP reales sin levantar el servidor.
 * Las dependencias externas (Prisma, Stripe) se mockean para aislar la lógica. -- Es correcto?
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

//  Mocks de las partes externas   

// Mock de Stripe para evitar errores de clave de API faltante en CI/testing
vi.mock('../config/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
  },
}));

// Mock del cliente Prisma asi evitamos intentos de conexión a la DB real
vi.mock('../prisma/client', () => ({
  default: {
    $queryRaw: vi.fn(),
    restaurant: { findMany: vi.fn(), findUnique: vi.fn() },
    reservation: { findMany: vi.fn(), count: vi.fn(), groupBy: vi.fn() },
    has_subscription: { findUnique: vi.fn() },
    penalty: { findFirst: vi.fn() },
    subscription: { findMany: vi.fn() },
  },
}));

// Mock del servicio de restaurantes para el test de endpoint
vi.mock('../services/restaurant.service', () => ({
  getAllRestaurantsOrderedByRating: vi.fn(),
  searchRestaurants: vi.fn(),
  getRestaurantsWithDiscounts: vi.fn(),
}));

import app from '../app';
import * as restaurantService from '../services/restaurant.service';

const mockGetAll = restaurantService.getAllRestaurantsOrderedByRating as ReturnType<typeof vi.fn>;

describe('Integración - endpoints HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('debe responder 200 con { ok: true }', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  describe('GET /api/restaurants', () => {
    it('debe responder 200 con un array de restaurantes', async () => {
      const mockRestaurants = [
        {
          id_restaurant: 'r1',
          name: 'La Parrilla',
          avgRating: 4.5,
          reviewCount: 12,
          street: 'Av. Corrientes',
          height: '1234',
          status: 1,
        },
      ];

      mockGetAll.mockResolvedValue(mockRestaurants);

      const res = await request(app).get('/api/restaurants');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('La Parrilla');
      expect(res.body[0].avgRating).toBe(4.5);
    });

    it('debe responder 500 si el servicio lanza un error', async () => {
      mockGetAll.mockRejectedValue(new Error('DB connection failed'));

      const res = await request(app).get('/api/restaurants');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});
