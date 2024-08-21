-- CreateTable
CREATE TABLE `VaultConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `acc_reserving_rate` VARCHAR(191) NOT NULL,
    `last_update` VARCHAR(191) NOT NULL,
    `liquidity` VARCHAR(191) NOT NULL,
    `reserved_amount` VARCHAR(191) NOT NULL,
    `unrealised_reserving_fee_amount` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
