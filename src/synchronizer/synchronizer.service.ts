import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { ABTCVaultAbi } from 'src/abis/aBtcVaultAbi';
import { AkkadConfig } from 'src/utils/helper';

@Injectable()
export class SentinelService {
    private readonly logger = new Logger(SentinelService.name);
    private prisma = new PrismaClient();

    private provider = new ethers.JsonRpcProvider(
        'https://rpc-testnet.akkad.network',
    );

    private wallet = new ethers.Wallet('0x121a7a8a7b974a2e76252671b4330126125b9d86ed6b93305f6d2c0a3288db8b', this.provider);
    private contract = new ethers.Contract(AkkadConfig.aBTCVaultAddress, ABTCVaultAbi, this.wallet);

    // @Cron(CronExpression.EVERY_10_SECONDS)
    async checkReadyEvents() {
        this.logger.log('Checking for Ready events...');

        try {
            const readyEvent = await this.prisma.crossChainDepositEvent.findFirst({
                where: { status: 'READY' },
            });
            if (readyEvent) {
                await this.executeContractOperation(readyEvent);
            }
        } catch (error) {
            this.logger.error('Error fetching or processing events:', error);
        }
    }



    private async executeContractOperation(event: any) {
        console.log("🚀 ~ SentinelService ~ executeContractOperation ~ executeContractOperation:")
        try {
            const { userAddressFrom, userAddressTo, amount } = event;

            this.logger.log(
                `Executing contract operation for event ID ${event.id}: ${amount} tokens from ${userAddressFrom} to ${userAddressTo}`,
            );
            const gasLimit = 5_000_000;
            const maxPriorityFeePerGas = ethers.parseUnits("30", "gwei");
            const maxFeePerGas = ethers.parseUnits("50", "gwei");

            const tx = await this.contract.transfer(
                userAddressTo,
                amount,
                {
                    gasLimit,
                    maxPriorityFeePerGas,
                    maxFeePerGas,
                }
            );

            this.logger.log(`Transaction sent: ${tx.hash}`);
            await tx.wait();
            this.logger.log(`Transaction confirmed: ${tx.hash}`);

            await this.prisma.crossChainDepositEvent.update({
                where: { id: event.id },
                data: { status: 'Processed' },
            });

            this.logger.log(`Event ID ${event.id} processed successfully.`);
        } catch (error) {
            this.logger.error(`Error processing event ID ${event.id}:`, error);
        }
    }
}