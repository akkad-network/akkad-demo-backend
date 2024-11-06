-- CreateTable
CREATE TABLE `CrossChainBridgeEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `targetChainIndex` INTEGER NOT NULL,
    `tokenAddress` VARCHAR(191) NOT NULL,
    `userAddressFrom` VARCHAR(191) NOT NULL,
    `userAddressTo` VARCHAR(191) NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
