-- -----------------------------------------------------
-- Paso 3: Inserción de datos de ejemplo (Versión 2.0)
-- -----------------------------------------------------

-- Limpiar tablas para evitar duplicados si se ejecuta más de una vez
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE useraccount;
TRUNCATE TABLE district;
TRUNCATE TABLE category;
TRUNCATE TABLE subscription;
TRUNCATE TABLE restaurant;
TRUNCATE TABLE dish;
TRUNCATE TABLE discount;
TRUNCATE TABLE reservation;
TRUNCATE TABLE review;
TRUNCATE TABLE penalty;
TRUNCATE TABLE consumption;
TRUNCATE TABLE has_subscription;
TRUNCATE TABLE restaurant_category;
TRUNCATE TABLE discount_subscription;
SET FOREIGN_KEY_CHECKS = 1;

-- Datos para la tabla `useraccount`
-- 5 owners y 10 clients
INSERT INTO useraccount (id_user, password_hash, name, email, phone, type) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'hash_owner1', 'Roberto Sanchez', 'roberto.sanchez@email.com', '1122334455', 'owner'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'hash_owner2', 'Laura Miguez', 'laura.miguez@email.com', '1122334466', 'owner'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'hash_owner3', 'Diego Fernandez', 'diego.fernandez@email.com', '1122334477', 'owner'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'hash_owner4', 'Sofia Perez', 'sofia.perez@email.com', '1122334488', 'owner'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'hash_owner5', 'Gabriel Torres', 'gabriel.torres@email.com', '1122334499', 'owner'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'hash_client1', 'Martin Garcia', 'martin.garcia@email.com', '1133445500', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'hash_client2', 'Paola Herrera', 'paola.herrera@email.com', '1133445511', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'hash_client3', 'Lucas Gimenez', 'lucas.gimenez@email.com', '1133445522', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'hash_client4', 'Florencia Lopez', 'florencia.lopez@email.com', '1133445533', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'hash_client5', 'Andres Rodriguez', 'andres.rodriguez@email.com', '1133445544', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'hash_client6', 'Valeria Rios', 'valeria.rios@email.com', '1133445555', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'hash_client7', 'Javier Castro', 'javier.castro@email.com', '1133445566', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'hash_client8', 'Silvina Acosta', 'silvina.acosta@email.com', '1133445577', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'hash_client9', 'Marcos Gimenez', 'marcos.gimenez@email.com', '1133445588', 'client'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'hash_client10', 'Camila Pardo', 'camila.pardo@email.com', '1133445599', 'client');

-- Datos para la tabla `district`
INSERT INTO district (id_district, name) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Centro'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Norte'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'Sur'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', 'Oeste');

-- Datos para la tabla `category`
INSERT INTO category (id_category, name, description) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'Italiana', 'Comida tradicional de Italia.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'Mexicana', 'Platillos picantes y sabrosos de México.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'Americana', 'Hamburguesas y platos típicos de EE. UU.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', 'Asiática', 'Sabores y aromas del continente asiático.'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', 'Vegetariana', 'Opciones sin carne.');

-- Datos para la tabla `subscription`
INSERT INTO subscription (id_subscription, plan_name, price, duration) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'Básico Mensual', 9.99, 30),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', 'Premium Anual', 99.99, 365);

-- Datos para la tabla `restaurant`
-- 3 restaurantes
INSERT INTO restaurant (id_restaurant, name, chair_amount, chair_available, street, height, image, opening_time, closing_time, id_owner, id_district, status) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'La Trattoria del Barrio', 50, 45, 'Calle Falsa', '123', 'Restaurant_1.webp', '12:00:00', '23:00:00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 1), -- Restaurante con 2 reviews
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'Tacos del Sol', 30, 28, 'Avenida Siempreviva', '742', 'Restaurant_2.webp', '18:00:00', '01:00:00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 1), -- Restaurante con 1 review
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Burger House', 40, 40, 'Boulevard de los Sueños Rotos', '500', 'Restaurant_3.webp', '11:00:00', '22:00:00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 1); -- Restaurante con 1 review

-- Datos para la tabla `dish`
INSERT INTO dish (dish_name, description, status, current_price, image, id_restaurant) VALUES
('Lasagna de Carne', 'Lasagna casera con salsa boloñesa y bechamel.', 1, 18.50, 'img_lasagna.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01'),
('Ravioles de espinaca', 'Ravioles rellenos de espinaca y ricota.', 1, 15.00, 'img_ravioles.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01'),
('Tacos de Pastor', 'Tacos de cerdo marinado con piña.', 1, 12.00, 'img_tacos.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02'),
('Guacamole con Nachos', 'Guacamole fresco con nachos caseros.', 1, 8.50, 'img_guacamole.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02'),
('Hamburguesa Clásica', 'Hamburguesa con lechuga, tomate y queso.', 1, 14.00, 'img_burger.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03'),
('Papas Fritas con Cheddar', 'Papas fritas con abundante salsa de queso cheddar.', 1, 7.00, 'img_papas.jpg', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03');

-- Datos para la tabla `discount`
INSERT INTO discount (dish_name, id_restaurant, description, percentage, status) VALUES
('Ravioles de espinaca', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'Descuento del 10% por día de la semana', 10.00, 1),
('Hamburguesa Clásica', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'Promo de fin de semana', 15.00, 1);

-- Datos para la tabla `reservation`
-- Reserva para 'La Trattoria del Barrio'
INSERT INTO reservation (id_reservation, reservation_date, diners, id_client, id_restaurant, status) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', '2025-09-02 20:00:00', 4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 1), -- Concluida
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', '2025-09-01 21:00:00', 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 1); -- Concluida

-- Reserva para 'Tacos del Sol'
INSERT INTO reservation (id_reservation, reservation_date, diners, id_client, id_restaurant, status) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', '2025-09-02 21:30:00', 3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 1); -- Concluida

-- Reserva para 'Burger House'
INSERT INTO reservation (id_reservation, reservation_date, diners, id_client, id_restaurant, status) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', '2025-09-03 13:00:00', 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 1); -- Concluida

-- Otras reservas
INSERT INTO reservation (id_reservation, reservation_date, diners, id_client, id_restaurant, status) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f05', '2025-09-04 20:00:00', 5, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 0), -- Recibida
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f06', '2025-09-03 20:30:00', 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 0), -- Recibida
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f07', '2025-09-01 19:00:00', 3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 2); -- Deserción

-- Datos para la tabla `review`
-- 'La Trattoria del Barrio' tiene 2 reviews
INSERT INTO review (id_reservation, rating, comment) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 5, 'Excelente experiencia, la lasagna estaba espectacular.'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', 4, 'Muy buena comida, el servicio podría mejorar un poco.');

-- 'Tacos del Sol' tiene 1 review
INSERT INTO review (id_reservation, rating, comment) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f03', 5, 'El lugar es genial, los tacos de pastor son increíbles.');

-- 'Burger House' tiene 1 review
INSERT INTO review (id_reservation, rating, comment) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f04', 3, 'La hamburguesa no me pareció tan buena como esperaba. El lugar es agradable.');

-- Datos para la tabla `penalty`
INSERT INTO penalty (id_client, penalty_start_date, penalty_end_date, client_reason) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', '2025-09-02', '2025-09-09', 'Olvido la reserva, sin aviso.');

-- Datos para la tabla `consumption`
INSERT INTO consumption (id_client, dish_name, id_restaurant) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Lasagna de Carne', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ravioles de espinaca', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Tacos de Pastor', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Hamburguesa Clásica', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03');

-- Datos para la tabla `has_subscription`
INSERT INTO has_subscription (id_client, id_subscription, adhesion_date) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', '2025-08-01');

-- Datos para la tabla `restaurant_category`
INSERT INTO restaurant_category (id_restaurant, id_category) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03');

-- Datos para la tabla `discount_subscription`
INSERT INTO discount_subscription (dish_name, id_restaurant, id_subscription) VALUES
('Ravioles de espinaca', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01');
