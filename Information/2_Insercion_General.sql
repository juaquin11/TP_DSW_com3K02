-- -----------------------------------------------------
-- Paso 3: Inserción de datos adaptada a nuevos requerimientos
-- -----------------------------------------------------

-- Limpiar tablas para evitar duplicados. Nótese que TRUNCATE discount fue eliminado.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE useraccount;
TRUNCATE TABLE district;
TRUNCATE TABLE category;
TRUNCATE TABLE subscription;
TRUNCATE TABLE restaurant;
TRUNCATE TABLE dish;
TRUNCATE TABLE reservation;
TRUNCATE TABLE review;
TRUNCATE TABLE penalty;
TRUNCATE TABLE consumption;
TRUNCATE TABLE has_subscription;
TRUNCATE TABLE restaurant_category;
TRUNCATE TABLE dish_subscription;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- Datos base (Distritos, Categorías, Suscripciones)
-- -----------------------------------------------------

-- Distritos de Rosario
INSERT INTO district (id_district, name) VALUES
('dist-centro', 'Centro'),
('dist-norte', 'Norte'),
('dist-sur', 'Sur'),
('dist-oeste', 'Oeste'),
('dist-noroeste', 'Noroeste'),
('dist-sudoeste', 'Sudoeste');

-- 12 Categorías
INSERT INTO category (id_category, name, description) VALUES
('cat-01', 'Parrilla', 'Clásicos cortes de carne a las brasas.'),
('cat-02', 'Italiana', 'Pastas caseras, pizzas y más.'),
('cat-03', 'Japonesa', 'Sushi, ramen y platos tradicionales de Japón.'),
('cat-04', 'Peruana', 'Ceviches, saltados y sabores del Perú.'),
('cat-05', 'Mexicana', 'Tacos, burritos y guacamole fresco.'),
('cat-06', 'Española', 'Tapas, paellas y gastronomía ibérica.'),
('cat-07', 'Vegana', 'Platos elaborados 100% a base de plantas.'),
('cat-08', 'Vegetariana', 'Opciones creativas sin carne.'),
('cat-09', 'De Autor', 'Cocina innovadora y experimental.'),
('cat-10', 'Americana', 'Hamburguesas, ribs y platos contundentes.'),
('cat-11', 'Árabe', 'Sabores de Medio Oriente.'),
('cat-12', 'Pescados y Mariscos', 'Frescura y sabor del mar.');

-- 3 Suscripciones
INSERT INTO subscription (id_subscription, plan_name, price, duration) VALUES
('sub-bronce', 'Plan Bronce', 5.99, 30),
('sub-plata', 'Plan Plata', 9.99, 30),
('sub-oro', 'Plan Oro Anual', 99.99, 365);

-- -----------------------------------------------------
-- Usuarios y Restaurantes
-- -----------------------------------------------------

-- 1 Owner y 5 Clientes
INSERT INTO useraccount (id_user, password_hash, name, email, phone, type) VALUES
('owner-01', 'hash_owner1', 'Ana Garcia', 'ana.garcia@email.com', '3410000001', 'owner'),
('client-01', 'hash_client1', 'Bruno Diaz', 'bruno.diaz@email.com', '3410000011', 'client'), -- Con suscripción
('client-02', 'hash_client2', 'Carla Rossi', 'carla.rossi@email.com', '3410000012', 'client'), -- Con suscripción
('client-03', 'hash_client3', 'Daniel Vega', 'daniel.vega@email.com', '3410000013', 'client'), -- Con suscripción
('client-04', 'hash_client4', 'Elena Soto', 'elena.soto@email.com', '3410000014', 'client'), -- Sin suscripción
('client-05', 'hash_client5', 'Franco Luna', 'franco.luna@email.com', '3410000015', 'client'); -- Sin suscripción y PENALIZADO

-- 2 Restaurantes del mismo owner
INSERT INTO restaurant (id_restaurant, name, chair_amount, chair_available, street, height, image, opening_time, closing_time, id_owner, id_district) VALUES
('resto-01', 'Fuegos del Litoral', 60, 60, 'Av. Pellegrini', '1550', 'fuegos_litoral.jpg', '20:00:00', '00:00:00', 'owner-01', 'dist-centro'),
('resto-02', 'Sushi Club Rosario', 40, 40, 'Bv. Oroño', '345', 'sushi_club.jpg', '19:30:00', '23:30:00', 'owner-01', 'dist-centro');

-- Asignación de categorías a los restaurantes
INSERT INTO restaurant_category (id_restaurant, id_category) VALUES
('resto-01', 'cat-01'), -- Parrilla
('resto-01', 'cat-09'), -- De Autor
('resto-02', 'cat-03'), -- Japonesa
('resto-02', 'cat-12'); -- Pescados y Mariscos

-- -----------------------------------------------------
-- Lógica de Clientes (Suscripciones y Penalidades)
-- -----------------------------------------------------

-- 3 clientes con suscripción
INSERT INTO has_subscription (id_client, id_subscription, adhesion_date) VALUES
('client-01', 'sub-oro', '2025-01-15'),
('client-02', 'sub-plata', '2025-06-20'),
('client-03', 'sub-bronce', '2025-08-10');

-- 1 cliente penalizado (de los que no tienen suscripción)
INSERT INTO penalty (id_client, penalty_start_date, penalty_end_date, client_reason) VALUES
('client-05', '2025-09-10', '2025-09-24', 'No se presentó a la reserva sin previo aviso.');

-- -----------------------------------------------------
-- Platos y Descuentos por Suscripción
-- -----------------------------------------------------

-- 5 Platos para 'Fuegos del Litoral' (resto-01)
INSERT INTO dish (dish_name, description, current_price, image, id_restaurant) VALUES
('Ojo de Bife', 'Corte premium de 400g con papas rústicas.', 25.00, 'ojo_de_bife.jpg', 'resto-01'),
('Mollejas a la Parrilla', 'Mollejas de corazón con limón y criolla.', 18.00, 'mollejas.jpg', 'resto-01'),
('Pacú a la Parrilla', 'Pesca de río con vegetales asados.', 22.50, 'pacu.jpg', 'resto-01'),
('Provoleta Especial', 'Queso provolone con tomates secos y rúcula.', 12.00, 'provoleta.jpg', 'resto-01'),
('Flan Casero', 'Postre clásico con dulce de leche y crema.', 8.00, 'flan.jpg', 'resto-01'); -- Este no tiene descuento

-- 4 de 5 platos de 'Fuegos del Litoral' con descuentos
INSERT INTO dish_subscription (dish_name, id_restaurant, id_subscription, discount) VALUES
('Ojo de Bife', 'resto-01', 'sub-oro', 20), -- Descuento del 20% para suscriptores Oro
('Mollejas a la Parrilla', 'resto-01', 'sub-plata', 15), -- Descuento del 15% para suscriptores Plata
('Mollejas a la Parrilla', 'resto-01', 'sub-oro', 15),   -- Mismo descuento para Oro
('Pacú a la Parrilla', 'resto-01', 'sub-plata', 10), -- Descuento del 10% para suscriptores Plata
('Provoleta Especial', 'resto-01', 'sub-bronce', 5);    -- Descuento del 5% para suscriptores Bronce

-- 5 Platos para 'Sushi Club Rosario' (resto-02)
INSERT INTO dish (dish_name, description, current_price, image, id_restaurant) VALUES
('Combinado Salmón', '15 piezas de rolls y niguiris de salmón.', 30.00, 'combinado_salmon.jpg', 'resto-02'),
('Ceviche Clásico', 'Pesca blanca, leche de tigre y batata.', 19.50, 'ceviche.jpg', 'resto-02'),
('Wok de Lomo', 'Trozos de lomo salteados con vegetales y arroz.', 21.00, 'wok_lomo.jpg', 'resto-02'),
('Gyozas de Cerdo', '5 empanaditas japonesas al vapor.', 11.00, 'gyozas.jpg', 'resto-02'),
('Cheesecake de Maracuyá', 'Postre cremoso con pulpa de maracuyá.', 9.50, 'cheesecake.jpg', 'resto-02'); -- Este no tiene descuento

-- 4 de 5 platos de 'Sushi Club Rosario' con descuentos
INSERT INTO dish_subscription (dish_name, id_restaurant, id_subscription, discount) VALUES
('Combinado Salmón', 'resto-02', 'sub-oro', 25), -- Descuento del 25% para suscriptores Oro
('Ceviche Clásico', 'resto-02', 'sub-plata', 10), -- Descuento del 10% para suscriptores Plata
('Ceviche Clásico', 'resto-02', 'sub-oro', 15),   -- Un descuento mayor para Oro
('Wok de Lomo', 'resto-02', 'sub-oro', 15),     -- Descuento del 15% para suscriptores Oro
('Gyozas de Cerdo', 'resto-02', 'sub-bronce', 10);  -- Descuento del 10% para suscriptores Bronce

-- -----------------------------------------------------
-- Reservas y Reseñas (1 por restaurante)
-- -----------------------------------------------------

-- Reserva y Reseña para 'Fuegos del Litoral'
INSERT INTO reservation (id_reservation, reservation_date, diners, id_client, id_restaurant, status) VALUES
('res-01', '2025-09-20 21:00:00', 2, 'client-01', 'resto-01', 3); -- Status 3 = Asistencia

INSERT INTO review (id_reservation, rating, comment) VALUES
('res-01', 5, 'El ojo de bife estuvo increíble. Un 10 la atención de los mozos. Volveremos.');

-- Reserva y Reseña para 'Sushi Club Rosario'
INSERT INTO reservation (id_reservation, reservation_date, diners, id_client, id_restaurant, status) VALUES
('res-02', '2025-09-22 20:30:00', 4, 'client-02', 'resto-02', 3); -- Status 3 = Asistencia

INSERT INTO review (id_reservation, rating, comment) VALUES
('res-02', 4, 'El sushi muy fresco y el lugar es hermoso. Tardaron un poco en traer la cuenta, pero todo lo demás excelente.');