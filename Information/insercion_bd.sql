
-- -----------------------------------------------------
-- Paso 3: Inserción de datos de ejemplo
-- -----------------------------------------------------

-- Datos para useraccount
INSERT INTO useraccount (id_user, password_hash, name, email, phone, type) VALUES
('4f3d2a1b-c7e8-4f9a-b0d1-1a2b3c4d5e6f', 'hashed_password_1', 'Juan Pérez', 'juan.perez@example.com', '1122334455', 'owner'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'hashed_password_2', 'Ana Gómez', 'ana.gomez@example.com', '2233445566', 'client'),
('b5c6d7e8-f9a0-1b2c-3d4e-5f6a7b8c9d0e', 'hashed_password_3', 'Luis López', 'luis.lopez@example.com', '3344556677', 'owner'),
('c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', 'hashed_password_4', 'Marta Ruiz', 'marta.ruiz@example.com', '4455667788', 'client');

-- Datos para district
INSERT INTO district (id_district, name) VALUES
('d1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'Palermo'),
('e2f3a4b5-c6d7-8e9f-a0b1-c2d3e4f5a6b7', 'Belgrano'),
('f3a4b5c6-d7e8-9f0a-b1c2-d3e4f5a6b7c8', 'Recoleta');

-- Datos para category
INSERT INTO category (id_category, name, description) VALUES
('c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6d', 'Pizza', 'Restaurantes especializados en pizzas.'),
('c2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7', 'Hamburguesas', 'Restaurantes que ofrecen hamburguesas artesanales y clásicas.'),
('c3c4d5e6-f7g8-9h0i-j1k2-l3m4n5o6p7q8', 'Comida Mexicana', 'Platillos típicos de la cocina mexicana.'),
('c4d5e6f7-g8h9-0i1j-k2l3-m4n5o6p7q8r9', 'Comida Italiana', 'Pastas, risottos y otros platos de la cocina italiana.');

-- Datos para subscription
INSERT INTO subscription (id_subscription, plan_name, price, duration) VALUES
('s1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6e', 'Básico', 9.99, 30),
('s2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p8', 'Premium', 19.99, 365);

-- Datos para restaurant
INSERT INTO restaurant (id_restaurant, name, chair_amount, chair_available, street, height, image, opening_time, closing_time, id_owner, id_district, status) VALUES
('r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6f', 'La Gran Pizza', 50, 50, 'Calle Falsa', '123', 'imagen_pizza.jpg', '12:00:00', '23:00:00', '4f3d2a1b-c7e8-4f9a-b0d1-1a2b3c4d5e6f', 'd1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 1),
('r2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p9', 'El Sabor Mexicano', 30, 30, 'Avenida Siempreviva', '456', 'imagen_mexico.jpg', '19:00:00', '02:00:00', 'b5c6d7e8-f9a0-1b2c-3d4e-5f6a7b8c9d0e', 'e2f3a4b5-c6d7-8e9f-a0b1-c2d3e4f5a6b7', 1);

-- Datos para dish
INSERT INTO dish (dish_name, description, status, current_price, image, id_restaurant) VALUES
('Pizza Napolitana', 'Clásica pizza con tomate, mozzarella y albahaca.', 1, 15.50, 'napolitana.jpg', 'r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6f'),
('Tacos al Pastor', 'Tacos de cerdo marinado con piña.', 1, 12.00, 'tacos.jpg', 'r2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p9');

-- Datos para discount
INSERT INTO discount (dish_name, id_restaurant, description, percentage, status) VALUES
('Pizza Napolitana', 'r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6f', '20% de descuento en Pizza Napolitana.', 20.00, 1);

-- Datos para reservation
INSERT INTO reservation (id_reservation, reservation_date, diners, id_client, id_restaurant, status) VALUES
('res1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6f', '2025-08-20 20:00:00', 4, 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6f', 0),
('res2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7', '2025-08-21 21:30:00', 2, 'c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', 'r2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p9', 1);

-- Datos para review
INSERT INTO review (id_reservation, rating, comment) VALUES
('res2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7', 5, 'Excelente comida y servicio. Muy recomendado.');

-- Datos para penalty
INSERT INTO penalty (id_client, penalty_start_date, penalty_end_date, client_reason) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '2025-08-22', '2025-08-29', 'No pude asistir por un imprevisto familiar.');

-- Datos para consumption
INSERT INTO consumption (id_client, dish_name, id_restaurant) VALUES
('c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', 'Tacos al Pastor', 'r2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p9');

-- Datos para has_subscription
INSERT INTO has_subscription (id_client, id_subscription, adhesion_date) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 's2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p8', '2025-07-15');

-- Datos para restaurant_category
INSERT INTO restaurant_category (id_restaurant, id_category) VALUES
('r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6f', 'c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6d'),
('r2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p9', 'c3c4d5e6-f7g8-9h0i-j1k2-l3m4n5o6p7q8');

-- Datos para discount_subscription
INSERT INTO discount_subscription (dish_name, id_restaurant, id_subscription) VALUES
('Pizza Napolitana', 'r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6f', 's2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p8');