-- CreateTable
CREATE TABLE `PositionRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `vault` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `closed` BOOLEAN NOT NULL,
    `reserved` VARCHAR(191) NOT NULL,
    `collateral` VARCHAR(191) NOT NULL,
    `position_size` VARCHAR(191) NOT NULL,
    `open_timestamp` VARCHAR(191) NOT NULL,
    `position_amount` VARCHAR(191) NOT NULL,
    `funding_fee_value` VARCHAR(191) NOT NULL,
    `last_funding_rate` VARCHAR(191) NOT NULL,
    `is_positive` BOOLEAN NOT NULL,
    `last_reserving_rate` VARCHAR(191) NOT NULL,
    `reserving_fee_amount` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `table_handle` VARCHAR(191) NOT NULL,
    `transaction_version` VARCHAR(191) NOT NULL,
    `write_set_change_index` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
