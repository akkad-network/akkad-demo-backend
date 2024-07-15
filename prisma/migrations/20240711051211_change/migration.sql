/*
  Warnings:

  - You are about to drop the column `collateral` on the `OrderRecord` table. All the data in the column will be lost.
  - You are about to drop the column `decoded_id` on the `OrderRecord` table. All the data in the column will be lost.
  - You are about to drop the column `decoded_key` on the `OrderRecord` table. All the data in the column will be lost.
  - You are about to drop the column `limited_index_precision` on the `OrderRecord` table. All the data in the column will be lost.
  - You are about to drop the column `open_amount` on the `OrderRecord` table. All the data in the column will be lost.
  - You are about to drop the column `reserve_amount` on the `OrderRecord` table. All the data in the column will be lost.
  - Added the required column `direction` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_type` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vault` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderRecord` DROP COLUMN `collateral`,
    DROP COLUMN `decoded_id`,
    DROP COLUMN `decoded_key`,
    DROP COLUMN `limited_index_precision`,
    DROP COLUMN `open_amount`,
    DROP COLUMN `reserve_amount`,
    ADD COLUMN `direction` VARCHAR(191) NOT NULL,
    ADD COLUMN `order_id` INTEGER NOT NULL,
    ADD COLUMN `order_type` VARCHAR(191) NOT NULL,
    ADD COLUMN `owner` VARCHAR(191) NOT NULL,
    ADD COLUMN `symbol` VARCHAR(191) NOT NULL,
    ADD COLUMN `vault` VARCHAR(191) NOT NULL;
