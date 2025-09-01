-- -----------------------------------------------------
-- Paso 3: Inserción de datos de ejemplo
-- -----------------------------------------------------

-- Datos para la tabla `useraccount`
-- Nota: Las contraseñas se insertan como texto plano para este ejemplo.
-- En un entorno real, usarías un hash como BCrypt.
INSERT INTO useraccount (id_user, password_hash, name, email, phone, type) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'hash_propietario1', 'Juan Pérez', 'juan.perez@example.com', '1122334455', 'owner'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'hash_propietario2', 'María Gómez', 'maria.gomez@example.com', '1133445566', 'owner'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'hash_cliente1', 'Carlos Ruiz', 'carlos.ruiz@example.com', '1144556677', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'hash_cliente2', 'Ana Torres', 'ana.torres@example.com', '1155667788', 'client');

-- Datos para la tabla `district`
INSERT INTO district (id_district, name) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'Centro'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'Norte'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13', 'Sur');

-- Datos para la tabla `category`
INSERT INTO category (id_category, name, description) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', 'Italiana', 'Comida tradicional de Italia.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12', 'Mexicana', 'Platillos picantes y sabrosos de México.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c13', 'Americana', 'Hamburguesas, papas fritas, etc.');

-- Datos para la tabla `subscription`
INSERT INTO subscription (id_subscription, plan_name, price, duration) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', 'Básico Mensual', 9.99, 30),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12', 'Premium Anual', 99.99, 365);

-- Datos para la tabla `restaurant`
INSERT INTO restaurant (id_restaurant, name, chair_amount, chair_available, street, height, image, opening_time, closing_time, id_owner, id_district, status) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'La Piazza', 50, 50, 'Calle Falsa', '123', 'img_la_piazza.jpg', '12:00:00', '23:00:00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 1),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 'El Mariachi Loco', 30, 30, 'Avenida Siempreviva', '742', 'img_el_mariachi.jpg', '18:00:00', '01:00:00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 1);

-- Datos para la tabla `dish`
INSERT INTO dish (dish_name, description, status, current_price, image, id_restaurant) VALUES
('Pizza Margherita', 'Pizza clásica con tomate y mozzarella.', 1, 15.50, 'img_pizza.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11'),
('Fajitas de Pollo', 'Fajitas con pollo, pimientos y cebolla.', 1, 18.75, 'img_fajitas.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12'),
('Hamburguesa Clásica', 'Hamburguesa de ternera con queso y lechuga.', 1, 12.00, 'img_burger.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11');

-- Datos para la tabla `discount`
INSERT INTO discount (dish_name, id_restaurant, description, percentage, status) VALUES
('Fajitas de Pollo', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 'Descuento del martes', 15.00, 1);

-- Datos para la tabla `reservation`
INSERT INTO reservation (id_reservation, reservation_date, cancellation_reason, diners, id_client, id_restaurant, status) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11', '2025-09-02 20:00:00', NULL, 4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 0),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f12', '2025-08-30 21:00:00', NULL, 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 1),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f13', '2025-09-01 13:30:00', 'No pudieron llegar a tiempo.', 3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 2);

-- Datos para la tabla `review`
-- La reserva 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f12' ya se concluyó (status = 1)
INSERT INTO review (id_reservation, rating, comment) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f12', 5, 'Excelente servicio y comida deliciosa. ¡Volveremos!');

-- Datos para la tabla `penalty`
-- El cliente 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' tuvo una deserción (status = 2)
INSERT INTO penalty (id_client, penalty_start_date, penalty_end_date, client_reason) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2025-09-02', '2025-09-09', 'Olvido de la reserva.');

-- Datos para la tabla `consumption`
INSERT INTO consumption (id_client, dish_name, id_restaurant) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Pizza Margherita', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Fajitas de Pollo', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12');

-- Datos para la tabla `has_subscription`
INSERT INTO has_subscription (id_client, id_subscription, adhesion_date) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', '2025-08-01');

-- Datos para la tabla `restaurant_category`
INSERT INTO restaurant_category (id_restaurant, id_category) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11'), -- La Piazza es Italiana
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12'); -- El Mariachi Loco es Mexicana

-- Datos para la tabla `discount_subscription`
INSERT INTO discount_subscription (dish_name, id_restaurant, id_subscription) VALUES
('Fajitas de Pollo', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11'); -- Descuento de subscripción