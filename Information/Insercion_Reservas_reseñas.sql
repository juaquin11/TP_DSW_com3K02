-- Usamos la base de datos app_desarrollo
USE app_desarrollo;

-----------------------------------------------------
-- Borrar reservas antiguas (para que no se acumulen)
-- -----------------------------------------------------
SET SQL_SAFE_UPDATES = 0;

DELETE FROM review;
DELETE FROM reservation;

SET SQL_SAFE_UPDATES = 1;



-- -----------------------------------------------------
-- Inserciones de reservas para la fecha de HOY
-- -----------------------------------------------------
-- cambiar id_client por i_user y id_restaurant por el del dueño a testear
-- id_user 43fdffe9-9fa1-11f0-a8f3-3822e2f3ab83  => fer
-- restaurante  e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01   |    f18e9497-9ef8-11f0-a8f3-3822e2f3ab83   =>  restaurante de tomy

-- Reserva 1: Estado 'pendiente' (0) para hoy a las 21:00
INSERT INTO reservation (reservation_date, diners, id_client, id_restaurant, status)
VALUES (CONCAT(CURDATE(), ' 21:00:00'), 4, '43fdffe9-9fa1-11f0-a8f3-3822e2f3ab83', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 0);

-- Reserva 2: Estado 'aceptada' (1) para hoy a las 20:30
INSERT INTO reservation (reservation_date, diners, id_client, id_restaurant, status)
VALUES (CONCAT(CURDATE(), ' 20:30:00'), 2, '43fdffe9-9fa1-11f0-a8f3-3822e2f3ab83', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 1);

-- Reserva 3: Estado 'rechazada' (2) para hoy a las 22:00
INSERT INTO reservation (reservation_date, diners, id_client, id_restaurant, status)
VALUES (CONCAT(CURDATE(), ' 22:00:00'), 5, '43fdffe9-9fa1-11f0-a8f3-3822e2f3ab83', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 2);

-- Reserva 4: Estado 'asistencia' (3) para una hora pasada de hoy (ej. 13:00)
INSERT INTO reservation (reservation_date, diners, id_client, id_restaurant, status)
VALUES (CONCAT(CURDATE(), ' 13:00:00'), 2, '43fdffe9-9fa1-11f0-a8f3-3822e2f3ab83', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 3);

-- Reserva 5: Estado 'ausencia' (4) para una hora pasada de hoy (ej. 14:00)
INSERT INTO reservation (reservation_date, diners, id_client, id_restaurant, status)
VALUES (CONCAT(CURDATE(), ' 14:00:00'), 3, '43fdffe9-9fa1-11f0-a8f3-3822e2f3ab83', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 4);

-- Reserva 6: Estado 'cancelada' (5) para hoy, con motivo de cancelación
-- INSERT INTO reservation (reservation_date, cancellation_reason, diners, id_client, id_restaurant, status)
-- VALUES (CONCAT(CURDATE(), ' 21:30:00'), 'El cliente canceló por un imprevisto.', 4, '43fdffe9-9fa1-11f0-a8f3-3822e2f3ab83', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 5);


-- -----------------------------------------------------
-- Inserción de reserva para la fecha de MAÑANA
-- -----------------------------------------------------

-- Reserva 7: Estado 'pendiente' (0) para mañana a las 20:00
INSERT INTO reservation (reservation_date, diners, id_client, id_restaurant, status)
VALUES (CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 20:00:00'), 2, '43fdffe9-9fa1-11f0-a8f3-3822e2f3ab83', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 0);