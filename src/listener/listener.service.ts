import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ListenerService implements OnModuleInit, OnModuleDestroy {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;
    private readonly contractAddress = '0x9813f09b21B87ff240E8c957def24a15Cec4d32E';
    private readonly abi = [
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: 'address', name: 'user', type: 'address' },
                { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'Deposit',
            type: 'event',
        },
    ];
    private readonly logger = new Logger(ListenerService.name);

    constructor(private readonly prisma: PrismaService) {
        this.initializeProviderAndContract();
    }

    private initializeProviderAndContract() {
        this.provider = new ethers.JsonRpcProvider(
            // 'https://holesky.infura.io/v3/89f6aa1d3c6e484c9aaf6c2693cdf8e5',
            'https://eth-holesky.g.alchemy.com/v2/fE8KoOll9N-1khheGreDyFHkzMrInSnh',
            // 'https://endpoints.omniatech.io/v1/eth/holesky/public',
        );

        this.contract = new ethers.Contract(this.contractAddress, this.abi, this.provider);
    }

    async listenToEvents() {
        this.logger.log('Listening to contract events...');

        try {
            this.contract.on('Deposit', async (from, value, event) => {
                this.logger.log(`Event detected: from ${from}, value: ${value}`);
                this.logger.log('Event details:', event.log.args);

                try {
                    await this.prisma.crossChainDepositEvent.create({
                        data: {
                            contractAddress: this.contractAddress,
                            userAddressFrom: from.toString(),
                            userAddressTo: from.toString(),
                            amount: value.toString(),
                            tokenAddress: '0xd44b02f1ab47750958dbdbe13489d37014c8ebd6',
                            status: 'READY',
                        },
                    });
                    this.logger.log(`Event stored successfully.`);
                } catch (dbError) {
                    this.logger.error('Error storing event in the database:', dbError);
                }
            });

            this.provider.on('error', (error) => {
                this.logger.error('Provider error detected:', error);
                this.restartListener();
            });
        } catch (error) {
            this.logger.error('Error while listening to events:', error);
            await this.restartListener();
        }
    }

    private async restartListener() {
        this.logger.warn('Restarting listener...');
        try {
            this.contract.removeAllListeners();
            this.initializeProviderAndContract();
            await this.listenToEvents();
        } catch (error) {
            this.logger.error('Failed to restart listener:', error);
            setTimeout(() => this.restartListener(), 10000);
        }
    }

    onModuleInit() {
        this.listenToEvents();
    }

    onModuleDestroy() {
        this.logger.log('Shutting down event listener...');
        this.contract.removeAllListeners();
    }
}