/*
  Warnings:

  - Added the required column `vault` to the `VaultConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `VaultConfig` ADD COLUMN `vault` VARCHAR(191) NOT NULL;
