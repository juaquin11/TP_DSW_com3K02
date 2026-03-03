/**
 * TEST B2 - Unitario: 
 * Valida la lógica de negocio de createReview:
 *  - Lanza error si la reserva no pertenece al usuario o no tiene el estado correcto.
 *  - Retorna la reseña creada cuando la reserva es válida.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../prisma/client', () => ({
  default: {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

import prisma from '../prisma/client';
import { createReview } from '../services/review.service';

const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;

describe('review.service - createReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe lanzar un error si la reserva no es válida para reseñar', async () => {
    // Simula que la transacción ejecuta el callback con un tx donde
    // findFirst devuelve null (reserva no encontrada / no pertenece al usuario / estado incorrecto).
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const mockTx = {
        reservation: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
        review: {
          create: vi.fn(),
        },
      };
      return fn(mockTx);
    });

    await expect(
      createReview('reserva-inexistente', 'user-1', 5, 'Excelente'),
    ).rejects.toThrow('Reserva no válida para reseñar');
  });

  it('debe crear y retornar la reseña cuando la reserva es válida', async () => {
    const mockCreatedReview = {
      review_number: 42,
      id_reservation: 'res-valida',
      rating: 4,
      comment: 'Muy buena atención',
    };

    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const mockTx = {
        reservation: {
          findFirst: vi.fn().mockResolvedValue({
            id_reservation: 'res-valida',
            id_client: 'user-1',
            status: 3, // asistencia
          }),
        },
        review: {
          create: vi.fn().mockResolvedValue(mockCreatedReview),
        },
      };
      return fn(mockTx);
    });

    const result = await createReview('res-valida', 'user-1', 4, 'Muy buena atención');

    expect(result).toEqual(mockCreatedReview);
    expect(result.rating).toBe(4);
  });
});
