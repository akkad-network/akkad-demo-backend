-- CreateTable
CREATE TABLE `LPTokenPriceRecords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` VARCHAR(191) NOT NULL,
    `price_formatted` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
