-- CreateTable
CREATE TABLE `ReferrerInfoRecords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vault` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `userAccount` VARCHAR(191) NOT NULL,
    `referrer` VARCHAR(191) NOT NULL,
    `rebate_user_amount` VARCHAR(191) NOT NULL,
    `rebate_referrer_amount` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LPSimulatePriceRecords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lpInName` VARCHAR(191) NOT NULL,
    `lpInAmount` VARCHAR(191) NOT NULL,
    `lpInPrice` VARCHAR(191) NOT NULL,
    `lpOutName` VARCHAR(191) NOT NULL,
    `lpOutAmount` VARCHAR(191) NOT NULL,
    `lpOutPrice` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
