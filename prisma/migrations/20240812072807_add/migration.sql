/*
  Warnings:

  - Added the required column `position_num` to the `DecreaseOrderRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DecreaseOrderRecord` ADD COLUMN `position_num` INTEGER NOT NULL;
