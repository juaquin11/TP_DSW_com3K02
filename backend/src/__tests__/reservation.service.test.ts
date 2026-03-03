/**
 * TEST B1 - Unitario:
 *
 * Sacamos `determineReservationStatus` de `getReservationsForToday`
 * y la llamamos con el parametro `now` opcional,
 *  lo que permite controlar el tiempo en los tests.
 *
 * Contempla los casos:
 *  - Reservas pendientes/aceptadas con fecha pasada -> "superada"
 *  - Reservas con fecha futura -> estado original sin modificar
 *  - Todos los estados que NO se ven afectados por la lógica de "superada"
 *  - Estado desconocido (código fuera del mapa)
 */
import { describe, it, expect } from 'vitest';
import { determineReservationStatus } from '../services/reservation.service';

// Referencia temporal fija para todos los tests (evita dependencia de Date.now())
const FIXED_NOW = new Date('2026-02-27T15:00:00Z');
const PAST      = new Date('2026-02-27T12:00:00Z'); // 3 horas antes de FIXED_NOW
const FUTURE    = new Date('2026-02-27T18:00:00Z'); // 3 horas después de FIXED_NOW

describe('determineReservationStatus - lógica de estado "superada"', () => {
  // ── Casos que deben convertirse en "superada" ──────────────────────────────

  it('reserva PENDIENTE (0) con fecha pasada → "superada"', () => {
    expect(determineReservationStatus(0, PAST, FIXED_NOW)).toBe('superada');
  });

  it('reserva ACEPTADA (1) con fecha pasada → "superada"', () => {
    expect(determineReservationStatus(1, PAST, FIXED_NOW)).toBe('superada');
  });

  // ── Casos que NO deben modificarse ─────────────────────────────────────────

  it('reserva PENDIENTE (0) con fecha futura → "pendiente"', () => {
    expect(determineReservationStatus(0, FUTURE, FIXED_NOW)).toBe('pendiente');
  });

  it('reserva ACEPTADA (1) con fecha futura → "aceptada"', () => {
    expect(determineReservationStatus(1, FUTURE, FIXED_NOW)).toBe('aceptada');
  });

  it('reserva RECHAZADA (2) con fecha pasada → "rechazada" (no aplica lógica de superada)', () => {
    expect(determineReservationStatus(2, PAST, FIXED_NOW)).toBe('rechazada');
  });

  it('reserva con ASISTENCIA (3) con fecha pasada → "asistencia"', () => {
    expect(determineReservationStatus(3, PAST, FIXED_NOW)).toBe('asistencia');
  });

  it('reserva con AUSENCIA (4) con fecha pasada → "ausencia"', () => {
    expect(determineReservationStatus(4, PAST, FIXED_NOW)).toBe('ausencia');
  });

  it('reserva CANCELADA (5) con fecha pasada → "cancelada"', () => {
    expect(determineReservationStatus(5, PAST, FIXED_NOW)).toBe('cancelada');
  });

  it('código de estado desconocido → "desconocido"', () => {
    expect(determineReservationStatus(99, PAST, FIXED_NOW)).toBe('desconocido');
  });
});
