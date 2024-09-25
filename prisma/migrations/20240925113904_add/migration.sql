-- CreateTable
CREATE TABLE `CampaignRank` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vault` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `userAddress` VARCHAR(191) NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `position_id` VARCHAR(191) NOT NULL,
    `transaction_version` VARCHAR(191) NOT NULL,
    `transaction_block_height` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
