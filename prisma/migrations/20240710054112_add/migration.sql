-- CreateTable
CREATE TABLE `UserReferralCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_address` VARCHAR(191) NOT NULL,
    `referral_code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferralRecords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `referrer_address` VARCHAR(191) NOT NULL,
    `referrer_code` VARCHAR(191) NOT NULL,
    `referral_user_address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
