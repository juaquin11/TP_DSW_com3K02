-- -----------------------------------------------------
-- Archivo: app_desarrollo_setup.sql
-- Descripción: Script completo para la creación de la base de datos
--              y la inserción de datos de ejemplo.
-- -----------------------------------------------------

-- Paso 1: Creación de la base de datos y usuario

CREATE DATABASE IF NOT EXISTS app_desarrollo;
USE app_desarrollo;

-- Crea el usuario y le otorga privilegios
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON app_desarrollo.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;

-- Generador de UUID por defecto en MySQL
-- Nota: MySQL 8 soporta UUID_TO_BIN y BIN_TO_UUID para mejor rendimiento

-- -----------------------------------------------------
-- Paso 2: Creación de las tablas
-- -----------------------------------------------------

-- Tabla useraccount
CREATE TABLE useraccount (
    id_user CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),  -- null si es 'client', solo sirve para ser mostrado en apartado de perfil.
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    type ENUM('owner', 'client') NOT NULL
);

-- Tabla district
CREATE TABLE district (
    id_district CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla category
CREATE TABLE category (
    id_category CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Tabla subscription
CREATE TABLE subscription (
    id_subscription CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL
);

-- Tabla restaurant
CREATE TABLE restaurant (
    id_restaurant CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    chair_amount INT NOT NULL,
    chair_available INT NOT NULL,
    street VARCHAR(100) NOT NULL,
    height VARCHAR(10) NOT NULL,
    image VARCHAR(255),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    id_owner CHAR(36) NOT NULL,
    id_district CHAR(36) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,   -- 0 'inactive'  |  1 'active'
    FOREIGN KEY (id_owner) REFERENCES useraccount(id_user),
    FOREIGN KEY (id_district) REFERENCES district(id_district)
);

-- Tabla dish
CREATE TABLE dish (
    dish_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,   -- 0 'inactive'  |  1 'active'
    current_price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    id_restaurant CHAR(36) NOT NULL,
    PRIMARY KEY (dish_name, id_restaurant),
    FOREIGN KEY (id_restaurant) REFERENCES restaurant(id_restaurant)
);

-- Tabla discount
CREATE TABLE discount (
    dish_name VARCHAR(100) NOT NULL,
    id_restaurant CHAR(36) NOT NULL,
    description TEXT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,    -- 0 'inactive'  |  1 'active'
    PRIMARY KEY (dish_name, id_restaurant),
    FOREIGN KEY (dish_name, id_restaurant) REFERENCES dish(dish_name, id_restaurant)
);

-- Tabla reservation
CREATE TABLE reservation (
    id_reservation CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reservation_date DATETIME NOT NULL,
    cancellation_reason TEXT,
    diners INT NOT NULL,
    id_client CHAR(36) NOT NULL,
    id_restaurant CHAR(36) NOT NULL,
    status TINYINT NOT NULL DEFAULT 0, -- 0 'recived'  |  1 'concluded' |   |  2 'deserted'  |  3 'desertion'
    FOREIGN KEY (id_client) REFERENCES useraccount(id_user),
    FOREIGN KEY (id_restaurant) REFERENCES restaurant(id_restaurant)
);

-- Tabla review
CREATE TABLE review (
    review_number INT AUTO_INCREMENT,
    id_reservation CHAR(36) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    PRIMARY KEY (review_number, id_reservation),
    FOREIGN KEY (id_reservation) REFERENCES reservation(id_reservation)
);

-- Tabla penalty
CREATE TABLE penalty (
    penalty_number INT AUTO_INCREMENT,
    id_client CHAR(36) NOT NULL,
    penalty_start_date DATE NOT NULL,
    penalty_end_date DATE NOT NULL,
    client_reason TEXT,
    PRIMARY KEY (penalty_number, id_client),
    FOREIGN KEY (id_client) REFERENCES useraccount(id_user)
);

-- Tabla consumption
CREATE TABLE consumption (
    id_client CHAR(36) NOT NULL,
    dish_name VARCHAR(100) NOT NULL,
    id_restaurant CHAR(36) NOT NULL,
    PRIMARY KEY (id_client, dish_name, id_restaurant),
    FOREIGN KEY (id_client) REFERENCES useraccount(id_user),
    FOREIGN KEY (dish_name, id_restaurant) REFERENCES dish(dish_name, id_restaurant)
);

-- Tabla has_subscription
CREATE TABLE has_subscription (
    id_client CHAR(36) PRIMARY KEY,
    id_subscription CHAR(36) NOT NULL,
    adhesion_date DATE NOT NULL,
    FOREIGN KEY (id_client) REFERENCES useraccount(id_user),
    FOREIGN KEY (id_subscription) REFERENCES subscription(id_subscription)
);

-- Tabla restaurant_category
CREATE TABLE restaurant_category (
    id_restaurant CHAR(36) NOT NULL,
    id_category CHAR(36) NOT NULL,
    PRIMARY KEY (id_restaurant, id_category),
    FOREIGN KEY (id_restaurant) REFERENCES restaurant(id_restaurant),
    FOREIGN KEY (id_category) REFERENCES category(id_category)
);

-- Tabla discount_subscription
CREATE TABLE discount_subscription (
    dish_name VARCHAR(100) NOT NULL,
    id_restaurant CHAR(36) NOT NULL,
    id_subscription CHAR(36) NOT NULL,
    PRIMARY KEY (dish_name, id_restaurant, id_subscription),
    FOREIGN KEY (id_subscription) REFERENCES subscription(id_subscription),
    FOREIGN KEY (dish_name, id_restaurant) REFERENCES dish(dish_name, id_restaurant)
);

