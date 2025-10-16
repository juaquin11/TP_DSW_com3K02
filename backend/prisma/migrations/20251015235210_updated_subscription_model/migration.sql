/*
  Warnings:

  - Added the required column `expiry_date` to the `has_subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `has_subscription` ADD COLUMN `expiry_date` DATE NOT NULL,
    ADD COLUMN `last_payment_id` VARCHAR(100) NULL,
    ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'active';
