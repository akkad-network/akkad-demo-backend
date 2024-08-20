/*
  Warnings:

  - Added the required column `decimal` to the `PriceFeederRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expo` to the `PriceFeederRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PriceFeederRecord` ADD COLUMN `decimal` INTEGER NOT NULL,
    ADD COLUMN `expo` INTEGER NOT NULL;
