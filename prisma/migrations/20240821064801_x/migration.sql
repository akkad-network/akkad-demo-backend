/*
  Warnings:

  - You are about to drop the column `unrealised_funding_fee_value_flag` on the `SymbolDirectionConfig` table. All the data in the column will be lost.
  - Added the required column `unrealised_funding_fee_flag` to the `SymbolDirectionConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SymbolDirectionConfig` DROP COLUMN `unrealised_funding_fee_value_flag`,
    ADD COLUMN `unrealised_funding_fee_flag` BOOLEAN NOT NULL;
