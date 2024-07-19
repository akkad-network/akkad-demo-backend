-- CreateTable
CREATE TABLE `AggregatePositionRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vault` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `average_funding_fee` VARCHAR(191) NOT NULL,
    `average_funding_rate` VARCHAR(191) NOT NULL,
    `average_reserving_rate` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
