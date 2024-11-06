/*
  Warnings:

  - Added the required column `chainIndex` to the `CrossChainDepositEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CrossChainDepositEvent` ADD COLUMN `chainIndex` INTEGER NOT NULL,
    ADD COLUMN `chainName` VARCHAR(191) NOT NULL DEFAULT '';
