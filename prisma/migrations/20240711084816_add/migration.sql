-- CreateTable
CREATE TABLE `GlobalSyncController` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `last_sync_transcation_verision` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
