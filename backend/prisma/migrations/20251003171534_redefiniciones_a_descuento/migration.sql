/*
  Warnings:

  - You are about to drop the `discount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `discount_subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `discount` DROP FOREIGN KEY `discount_ibfk_1`;

-- DropForeignKey
ALTER TABLE `discount_subscription` DROP FOREIGN KEY `discount_subscription_ibfk_1`;

-- DropForeignKey
ALTER TABLE `discount_subscription` DROP FOREIGN KEY `discount_subscription_ibfk_2`;

-- DropTable
DROP TABLE `discount`;

-- DropTable
DROP TABLE `discount_subscription`;

-- CreateTable
CREATE TABLE `dish_subscription` (
    `dish_name` VARCHAR(100) NOT NULL,
    `id_restaurant` CHAR(36) NOT NULL,
    `id_subscription` CHAR(36) NOT NULL,
    `discount` INTEGER NOT NULL,

    INDEX `id_subscription`(`id_subscription`),
    PRIMARY KEY (`dish_name`, `id_restaurant`, `id_subscription`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dish_subscription` ADD CONSTRAINT `discount_subscription_ibfk_1` FOREIGN KEY (`id_subscription`) REFERENCES `subscription`(`id_subscription`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dish_subscription` ADD CONSTRAINT `discount_subscription_ibfk_2` FOREIGN KEY (`dish_name`, `id_restaurant`) REFERENCES `dish`(`dish_name`, `id_restaurant`) ON DELETE NO ACTION ON UPDATE NO ACTION;
