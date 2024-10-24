import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

@Injectable()
export class SentinelService {
    private readonly logger = new Logger(SentinelService.name);
    private prisma = new PrismaClient();

    private provider = new ethers.JsonRpcProvider(
        'https://rpc-testnet.akkad.network',
    );

    //0xd78F5fd4ba999A4772392EC0270641fD871f2e73
    private wallet = new ethers.Wallet('0x121a7a8a7b974a2e76252671b4330126125b9d86ed6b93305f6d2c0a3288db8b', this.provider);

    private contractAddress = '0xDFbb3d60015314f7c8e16a317146B21D3ed8ebB7';
    private abi = [
        {
            "inputs": [
                {
                    "internalType": "address payable",
                    "name": "_to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_amount",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
    ];

    @Cron(CronExpression.EVERY_10_SECONDS)
    async checkReadyEvents() {
        this.logger.log('Checking for Ready events...');

        try {
            const readyEvent = await this.prisma.crossChainDepositEvent.findFirst({
                where: { status: 'Ready' },
            });
            if (readyEvent) {
                await this.executeContractOperation(readyEvent);
            }
        } catch (error) {
            this.logger.error('Error fetching or processing events:', error);
        }
    }


    private contract = new ethers.Contract(this.contractAddress, this.abi, this.wallet);


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