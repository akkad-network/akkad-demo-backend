/*
  Warnings:

  - You are about to drop the column `last_sync_transcation_verision` on the `GlobalSyncController` table. All the data in the column will be lost.
  - Added the required column `last_sync_transaction_verision` to the `GlobalSyncController` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `GlobalSyncController` DROP COLUMN `last_sync_transcation_verision`,
    ADD COLUMN `last_sync_transaction_verision` VARCHAR(191) NOT NULL;
