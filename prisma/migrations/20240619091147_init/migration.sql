/*
  Warnings:

  - Added the required column `collateral` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `limited_index_precision` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `open_amount` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reserve_amount` to the `OrderRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderRecord` ADD COLUMN `collateral` VARCHAR(191) NOT NULL,
    ADD COLUMN `limited_index_precision` VARCHAR(191) NOT NULL,
    ADD COLUMN `open_amount` VARCHAR(191) NOT NULL,
    ADD COLUMN `reserve_amount` VARCHAR(191) NOT NULL;
