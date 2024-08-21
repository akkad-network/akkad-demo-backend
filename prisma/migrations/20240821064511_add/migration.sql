-- CreateTable
CREATE TABLE `SymbolDirectionConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `acc_funding_rate_flag` BOOLEAN NOT NULL,
    `acc_funding_rate_value` VARCHAR(191) NOT NULL,
    `opening_amount` VARCHAR(191) NOT NULL,
    `opening_size` VARCHAR(191) NOT NULL,
    `realised_pnl_flag` BOOLEAN NOT NULL,
    `realised_pnl_value` VARCHAR(191) NOT NULL,
    `unrealised_funding_fee_value_flag` BOOLEAN NOT NULL,
    `unrealised_funding_fee_value` VARCHAR(191) NOT NULL,
    `last_update` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
