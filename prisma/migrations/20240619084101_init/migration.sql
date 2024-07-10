-- CreateTable
CREATE TABLE `OrderRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decoded_id` INTEGER NOT NULL,
    `decoded_key` JSON NOT NULL,
    `fee` VARCHAR(191) NOT NULL,
    `executed` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `take_profit` BOOLEAN NOT NULL,
    `decrease_amount` VARCHAR(191) NOT NULL,
    `limited_index_pirce` VARCHAR(191) NOT NULL,
    `collateral_price_threshold` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `table_handle` VARCHAR(191) NOT NULL,
    `transaction_version` VARCHAR(191) NOT NULL,
    `write_set_change_index` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
