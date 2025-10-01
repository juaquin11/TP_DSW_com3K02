-- CreateTable
CREATE TABLE `category` (
    `id_category` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id_category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consumption` (
    `id_client` CHAR(36) NOT NULL,
    `dish_name` VARCHAR(100) NOT NULL,
    `id_restaurant` CHAR(36) NOT NULL,

    INDEX `dish_name`(`dish_name`, `id_restaurant`),
    PRIMARY KEY (`id_client`, `dish_name`, `id_restaurant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discount` (
    `dish_name` VARCHAR(100) NOT NULL,
    `id_restaurant` CHAR(36) NOT NULL,
    `description` TEXT NOT NULL,
    `percentage` DECIMAL(5, 2) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,

    PRIMARY KEY (`dish_name`, `id_restaurant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discount_subscription` (
    `dish_name` VARCHAR(100) NOT NULL,
    `id_restaurant` CHAR(36) NOT NULL,
    `id_subscription` CHAR(36) NOT NULL,

    INDEX `id_subscription`(`id_subscription`),
    PRIMARY KEY (`dish_name`, `id_restaurant`, `id_subscription`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dish` (
    `dish_name` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `current_price` DECIMAL(10, 2) NOT NULL,
    `image` VARCHAR(255) NULL,
    `id_restaurant` CHAR(36) NOT NULL,

    INDEX `id_restaurant`(`id_restaurant`),
    PRIMARY KEY (`dish_name`, `id_restaurant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `district` (
    `id_district` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id_district`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `has_subscription` (
    `id_client` CHAR(36) NOT NULL,
    `id_subscription` CHAR(36) NOT NULL,
    `adhesion_date` DATE NOT NULL,

    INDEX `id_subscription`(`id_subscription`),
    PRIMARY KEY (`id_client`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penalty` (
    `penalty_number` INTEGER NOT NULL AUTO_INCREMENT,
    `id_client` CHAR(36) NOT NULL,
    `penalty_start_date` DATE NOT NULL,
    `penalty_end_date` DATE NOT NULL,
    `client_reason` TEXT NULL,

    INDEX `id_client`(`id_client`),
    PRIMARY KEY (`penalty_number`, `id_client`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation` (
    `id_reservation` CHAR(36) NOT NULL DEFAULT (uuid()),
    `reservation_date` DATETIME(0) NOT NULL,
    `cancellation_reason` TEXT NULL,
    `diners` INTEGER NOT NULL,
    `id_client` CHAR(36) NOT NULL,
    `id_restaurant` CHAR(36) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 0,

    INDEX `id_client`(`id_client`),
    INDEX `id_restaurant`(`id_restaurant`),
    PRIMARY KEY (`id_reservation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant` (
    `id_restaurant` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(100) NOT NULL,
    `chair_amount` INTEGER NOT NULL,
    `chair_available` INTEGER NOT NULL,
    `street` VARCHAR(100) NOT NULL,
    `height` VARCHAR(10) NOT NULL,
    `image` VARCHAR(255) NULL,
    `opening_time` TIME(0) NOT NULL,
    `closing_time` TIME(0) NOT NULL,
    `id_owner` CHAR(36) NOT NULL,
    `id_district` CHAR(36) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,

    INDEX `id_district`(`id_district`),
    INDEX `id_owner`(`id_owner`),
    PRIMARY KEY (`id_restaurant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_category` (
    `id_restaurant` CHAR(36) NOT NULL,
    `id_category` CHAR(36) NOT NULL,

    INDEX `id_category`(`id_category`),
    PRIMARY KEY (`id_restaurant`, `id_category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review` (
    `review_number` INTEGER NOT NULL AUTO_INCREMENT,
    `id_reservation` CHAR(36) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,

    UNIQUE INDEX `review_id_reservation_key`(`id_reservation`),
    PRIMARY KEY (`review_number`, `id_reservation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `id_subscription` CHAR(36) NOT NULL DEFAULT (uuid()),
    `plan_name` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `duration` INTEGER NOT NULL,

    PRIMARY KEY (`id_subscription`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `useraccount` (
    `id_user` CHAR(36) NOT NULL DEFAULT (uuid()),
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `type` ENUM('owner', 'client') NOT NULL,

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `consumption` ADD CONSTRAINT `consumption_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `useraccount`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `consumption` ADD CONSTRAINT `consumption_ibfk_2` FOREIGN KEY (`dish_name`, `id_restaurant`) REFERENCES `dish`(`dish_name`, `id_restaurant`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `discount` ADD CONSTRAINT `discount_ibfk_1` FOREIGN KEY (`dish_name`, `id_restaurant`) REFERENCES `dish`(`dish_name`, `id_restaurant`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `discount_subscription` ADD CONSTRAINT `discount_subscription_ibfk_1` FOREIGN KEY (`id_subscription`) REFERENCES `subscription`(`id_subscription`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `discount_subscription` ADD CONSTRAINT `discount_subscription_ibfk_2` FOREIGN KEY (`dish_name`, `id_restaurant`) REFERENCES `dish`(`dish_name`, `id_restaurant`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dish` ADD CONSTRAINT `dish_ibfk_1` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `has_subscription` ADD CONSTRAINT `has_subscription_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `useraccount`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `has_subscription` ADD CONSTRAINT `has_subscription_ibfk_2` FOREIGN KEY (`id_subscription`) REFERENCES `subscription`(`id_subscription`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `penalty` ADD CONSTRAINT `penalty_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `useraccount`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `useraccount`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `restaurant` ADD CONSTRAINT `restaurant_ibfk_1` FOREIGN KEY (`id_owner`) REFERENCES `useraccount`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `restaurant` ADD CONSTRAINT `restaurant_ibfk_2` FOREIGN KEY (`id_district`) REFERENCES `district`(`id_district`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `restaurant_category` ADD CONSTRAINT `restaurant_category_ibfk_1` FOREIGN KEY (`id_restaurant`) REFERENCES `restaurant`(`id_restaurant`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `restaurant_category` ADD CONSTRAINT `restaurant_category_ibfk_2` FOREIGN KEY (`id_category`) REFERENCES `category`(`id_category`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`id_reservation`) REFERENCES `reservation`(`id_reservation`) ON DELETE NO ACTION ON UPDATE NO ACTION;
