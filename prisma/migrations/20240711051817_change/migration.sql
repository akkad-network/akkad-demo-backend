/*
  Warnings:

  - You are about to drop the `OrderRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `OrderRecord`;

-- CreateTable
CREATE TABLE `DecreaseOrderRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `owner` VARCHAR(191) NOT NULL,
    `order_type` VARCHAR(191) NOT NULL,
    `vault` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `fee` VARCHAR(191) NOT NULL,
    `executed` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `take_profit` BOOLEAN NOT NULL,
    `decrease_amount` VARCHAR(191) NOT NULL,
    `limited_index_price` VARCHAR(191) NOT NULL,
    `collateral_price_threshold` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `table_handle` VARCHAR(191) NOT NULL,
    `transaction_version` VARCHAR(191) NOT NULL,
    `write_set_change_index` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
