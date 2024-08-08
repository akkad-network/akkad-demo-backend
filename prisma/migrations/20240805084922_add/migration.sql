-- AlterTable
ALTER TABLE `IncreaseOrderRecord` ADD COLUMN `created_transaction_version` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PositionRecord` ADD COLUMN `created_transaction_version` VARCHAR(191) NULL;
