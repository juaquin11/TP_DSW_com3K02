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
