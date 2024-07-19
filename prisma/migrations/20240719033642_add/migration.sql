-- AlterTable
ALTER TABLE `PositionRecord` ADD COLUMN `funding_fee_is_positive` BOOLEAN NULL,
    ADD COLUMN `last_funding_is_positive` BOOLEAN NULL;
