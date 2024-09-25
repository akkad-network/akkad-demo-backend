/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `CampaignSocialRecords` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CampaignSocialRecords_address_key` ON `CampaignSocialRecords`(`address`);
