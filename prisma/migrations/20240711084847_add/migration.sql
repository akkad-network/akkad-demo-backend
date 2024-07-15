/*
  Warnings:

  - Added the required column `sync_type` to the `GlobalSyncController` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `GlobalSyncController` ADD COLUMN `sync_type` VARCHAR(191) NOT NULL;
