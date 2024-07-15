/*
  Warnings:

  - You are about to drop the column `open_amout` on the `IncreaseOrderRecord` table. All the data in the column will be lost.
  - Added the required column `open_amount` to the `IncreaseOrderRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `IncreaseOrderRecord` DROP COLUMN `open_amout`,
    ADD COLUMN `open_amount` VARCHAR(191) NOT NULL;
