/*
  Warnings:

  - Added the required column `transaction_version` to the `ReferrerInfoRecords` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ReferrerInfoRecords` ADD COLUMN `transaction_version` VARCHAR(191) NOT NULL;
