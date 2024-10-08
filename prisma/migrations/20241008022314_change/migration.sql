/*
  Warnings:

  - You are about to alter the column `rebate_user_amount` on the `ReferrerInfoRecords` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.
  - You are about to alter the column `rebate_referrer_amount` on the `ReferrerInfoRecords` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `ReferrerInfoRecords` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `ReferrerInfoRecords` MODIFY `rebate_user_amount` DECIMAL(65, 30) NOT NULL,
    MODIFY `rebate_referrer_amount` DECIMAL(65, 30) NOT NULL,
    MODIFY `amount` DECIMAL(65, 30) NOT NULL;
