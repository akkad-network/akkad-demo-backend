import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { ABTCVaultAbi } from 'src/abis/aBtcVaultAbi';
import { CrossChainVaultAbi } from 'src/abis/crossChainVaultAbi';
import { PrismaService } from 'src/prisma/prisma.service';
import { AkkadConfig, SourceChainsList } from 'src/utils/helper';

@Injectable()
export class ListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ListenerService.name);
    private mutilContracts: any[] = [];

    private akkadContract: any
    constructor(private readonly prisma: PrismaService) {
        this.initializeProviderAndContract();
        this.initialAkkadListener();
    }

    private initialAkkadListener() {
        const provider = new ethers.JsonRpcProvider(
            AkkadConfig.chainRpc
        );
        this.akkadContract = new ethers.Contract(AkkadConfig.aBTCVaultAddress, ABTCVaultAbi, provider)
    }

    private initializeProviderAndContract() {
        for (const chainInfo of SourceChainsList) {
            const provider = new ethers.JsonRpcProvider(
                chainInfo.chainRpc
            );
            this.mutilContracts.push(
                {
                    providerInfo: provider,
                    contractInfo: new ethers.Contract(chainInfo.crossChainVaultAddress, CrossChainVaultAbi, provider),
                    chainInfo

                })
        }

    }

    async listenToAkkad() {
        this.logger.log('Listening to AKKAD events...');
        this.akkadContract.on('Redeem', async (from: any, amount: any, chainIndex: any) => {
            try {
                await this.prisma.akkadRedeemEvent.create({
                    data: {
                        targetChainIndex: Number(chainIndex),
                        userAddressFrom: from.toString(),
                        userAddressTo: from.toString(),
                        amount: amount.toString(),
                        status: 'READY',
                    },
                });
                this.logger.log(`Event stored successfully.`);
            } catch (dbError) {
                this.logger.error('Error storing event in the database:', dbError);
            }
        });
    }

    async listenToEvents() {
        this.logger.log('Listening to contract events...');

        this.mutilContracts.map(async (single: any) => {
            try {
                single.contractInfo.on('Deposit', async (from: any, tokenAddress: any, amount: any) => {
                    try {
                        await this.prisma.crossChainDepositEvent.create({
                            data: {
                                chainIndex: single.chainInfo.index,
                                chainName: single.chainInfo.name,
                                contractAddress: single.chainInfo.crossChainVaultAddress,
                                userAddressFrom: from.toString(),
                                userAddressTo: from.toString(),
                                amount: amount.toString(),
                                tokenAddress: tokenAddress,
                                status: 'READY',
                            },
                        });
                        this.logger.log(`Event stored successfully.`);
                    } catch (dbError) {
                        this.logger.error('Error storing event in the database:', dbError);
                    }
                });

                single.contractInfo.on('CrossChainDepositEvent', async (from: any, targetChain: number, tokenAddress: any, amount: any) => {
                    try {
                        await this.prisma.crossChainBridgeEvent.create({
                            data: {
                                targetChainIndex: Number(targetChain),
                                userAddressFrom: from.toString(),
                                userAddressTo: from.toString(),
                                tokenAddress: tokenAddress,
                                amount: amount.toString(),
                                status: 'READY',
                            },
                        });
                        this.logger.log(`Event stored successfully.`);
                    } catch (dbError) {
                        this.logger.error('Error storing event in the database:', dbError);
                    }
                });

                single.providerInfo.on('error', (error) => {
                    this.logger.error('Provider error detected:', error);
                    this.restartListener();
                });
            } catch (error) {
                this.logger.error('Error while listening to events:', error);
                await this.restartListener();
            }
        })
    }

    private async restartListener() {
        this.logger.warn('Restarting listener...');
        try {
            this.mutilContracts.map((contract: any) => {
                contract.contractInfo.removeAllListeners();
                this.initializeProviderAndContract();
            })

            await this.listenToEvents();
        } catch (error) {
            this.logger.error('Failed to restart listener:', error);
            setTimeout(() => this.restartListener(), 10000);
        }
    }

    onModuleInit() {
        this.listenToEvents();
        this.listenToAkkad()
    }

    onModuleDestroy() {
        this.logger.log('Shutting down event listener...');
        this.mutilContracts.map((contract: any) => {
            contract.contractInfo.removeAllListeners();
            this.initializeProviderAndContract();
        })

    }
}