-- CreateTable
CREATE TABLE `PositionOrderHandle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vault` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `position_handle` VARCHAR(191) NOT NULL,
    `increase_order_handle` VARCHAR(191) NOT NULL,
    `decrease_order_handle` VARCHAR(191) NOT NULL,
    `version_number` INTEGER NOT NULL DEFAULT 1,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
