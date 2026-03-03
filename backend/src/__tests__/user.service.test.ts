/**
 * TEST B3 - Unitario: 
 * Valida getUserStatus: el conteo de notificaciones varía según el tipo de usuario.
 *  - Cliente: reservas con asistencia (status 3) sin reseña.
 *  - Dueño: reservas pendientes (status 0) en sus restaurantes.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../prisma/client', () => ({
  default: {
    has_subscription: {
      findUnique: vi.fn(),
    },
    penalty: {
      findFirst: vi.fn(),
    },
    reservation: {
      count: vi.fn(),
    },
  },
}));

import prisma from '../prisma/client';
import { getUserStatus } from '../services/user.service';

describe('user.service - getUserStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto: sin suscripción activa, sin penalización
    vi.mocked(prisma.has_subscription.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.penalty.findFirst).mockResolvedValue(null);
  });

  it('debe retornar el conteo de reservas pendientes de reseña para un CLIENTE', async () => {
    vi.mocked(prisma.reservation.count).mockResolvedValue(3); // 3 reservas con asistencia sin reseña

    const status = await getUserStatus({ id_user: 'client-1', type: 'client' });

    expect(status.notificationCount).toBe(3);
    expect(status.hasActiveSubscription).toBe(false);
    expect(status.hasActivePenalty).toBe(false);
  });

  it('debe retornar el conteo de reservas pendientes de gestión para un DUEÑO', async () => {
    vi.mocked(prisma.reservation.count).mockResolvedValue(7); // 7 reservas pendientes en sus restaurantes

    const status = await getUserStatus({ id_user: 'owner-1', type: 'owner' });

    expect(status.notificationCount).toBe(7);
  });

  it('debe detectar suscripción activa y penalización activa correctamente', async () => {
    vi.mocked(prisma.has_subscription.findUnique).mockResolvedValue({ id_client: 'client-2' } as any); // tiene suscripción
    vi.mocked(prisma.penalty.findFirst).mockResolvedValue({ penalty_end_date: new Date(Date.now() + 86400000) } as any); // penalización vigente
    vi.mocked(prisma.reservation.count).mockResolvedValue(0);

    const status = await getUserStatus({ id_user: 'client-2', type: 'client' });

    expect(status.hasActiveSubscription).toBe(true);
    expect(status.hasActivePenalty).toBe(true);
  });
});
