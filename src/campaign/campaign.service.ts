import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust the import path based on your project structure
import { Cron, CronExpression } from '@nestjs/schedule';
import { aptos, MODULE_ADDRESS } from 'src/main';
import { getSideAddress, PAIRS, SymbolList, VaultList } from 'src/utils/helper';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CampaignService {
    private readonly logger = new Logger(CampaignService.name)

    private readonly SYNC_CAMPAIGN_EVENTS = process.env.SYNC_CAMPAIGN_EVENTS

    constructor(private readonly prisma: PrismaService,
    ) { }

    private isSyncRankInProcess = false

    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleSyncSymbolConfig() {
        if (this.isFunctionOn(this.SYNC_CAMPAIGN_EVENTS)) {
            if (this.isSyncRankInProcess) return
            this.isSyncRankInProcess = true
            await this.syncOnChainEvents();
            this.isSyncRankInProcess = false
        }
    }


    async campaignRank() {
        const totals = await this.prisma.campaignRank.groupBy({
            by: ['userAddress', 'vault', 'eventType'],
            _sum: {
                amount: true,
            },
            where: {
                eventType: { in: ['UserCollateralIn', 'UserCollateralOut'] },
            },
        });

        const userTotals: Record<string, Record<string, Decimal>> = {};

        totals.forEach(entry => {
            const { userAddress, vault, eventType } = entry;
            const amount = new Decimal(entry._sum.amount || 0);

            if (!userTotals[userAddress]) {
                userTotals[userAddress] = {};
            }
            if (!userTotals[userAddress][vault]) {
                userTotals[userAddress][vault] = new Decimal(0);
            }

            if (eventType === 'UserCollateralOut') {
                userTotals[userAddress][vault] = userTotals[userAddress][vault].plus(amount);
            } else if (eventType === 'UserCollateralIn') {
                userTotals[userAddress][vault] = userTotals[userAddress][vault].minus(amount);
            }
        });

        const formattedTotals = Object.entries(userTotals).map(([userAddress, vaults]) => {
            const details = VaultList.map(vault => {
                const amount = vaults[vault.symbol] ? vaults[vault.symbol].toNumber() : 0;
                return {
                    vault: vault.symbol,
                    decimal: vault.decimal,
                    deltaAmount: amount,
                };
            });

            return {
                userAddress,
                details,
            };
        });

        return formattedTotals;
    }

    async syncOnChainEvents() {
        const lastSync = await this.prisma.globalSyncController.findFirst({
            where: {
                sync_type: 'CAMPAIGN_RANK_RECORD'
            }
        })
        let lastVersion = '6038148049'
        if (lastSync) {
            lastVersion = lastSync.last_sync_transaction_verision
        } else {
            await this.prisma.globalSyncController.create({
                data: {
                    sync_type: 'CAMPAIGN_RANK_RECORD',
                    last_sync_transaction_verision: '6038148049'
                }
            })
        }
        for (const pair of PAIRS) {
            const vaultInfo = VaultList.find((item) => item.symbol === pair.vault)
            const symbolInfo = SymbolList.find((item) => item.tokenSymbol === pair.symbol)
            const direction = pair.direction
            const eventTypeIn = `${MODULE_ADDRESS}::market::UserCollateralIn<${vaultInfo.tokenAddress}, ${symbolInfo.tokenAddress}, ${getSideAddress(direction)}>`
            const eventTypeOut = `${MODULE_ADDRESS}::market::UserCollateralOut<${vaultInfo.tokenAddress}, ${symbolInfo.tokenAddress}, ${getSideAddress(direction)}>`

            try {
                const result = await aptos.getEvents({
                    options: {
                        where: {
                            transaction_version: { _gt: lastVersion },
                            _or: [
                                { type: { _eq: eventTypeIn } },
                                { type: { _eq: eventTypeOut } },
                            ]
                        }

                    }
                })

                if (result && result.length > 0) {
                    for (const item of result) {
                        const vault = vaultInfo.symbol
                        const symbol = symbolInfo.tokenSymbol //direction
                        const eventTypeRaw = item.type
                        let eventType = ''
                        if (eventTypeRaw.indexOf('UserCollateralIn') !== -1) {
                            eventType = 'UserCollateralIn'
                        } else if (eventTypeRaw.indexOf('UserCollateralOut') !== -1) {
                            eventType = 'UserCollateralOut'
                        } else {
                            eventType = 'Unknown'
                        }
                        const userAddress = item?.data?.user
                        const amount = item?.data?.amount
                        const position_id = item?.data?.position_id.toString()
                        const transaction_version = item?.transaction_version.toString()
                        const transaction_block_height = item?.transaction_block_height.toString()
                        const vaultDecimal = vaultInfo.decimal.toString()

                        const minimum_required = await this.prisma.positionOrderHandle.findFirst({
                            where: {
                                vault, symbol, direction
                            }
                        })

                        if (minimum_required) {
                            const minimum_position_id = minimum_required.creation_num
                            if (position_id >= minimum_position_id) {
                                await this.prisma.campaignRank.create({
                                    data: {
                                        vault, symbol, direction, eventType, vaultDecimal, userAddress, amount, position_id, transaction_version, transaction_block_height
                                    }
                                })

                            }
                        }
                    }

                    const campaignLast = await this.prisma.campaignRank.findFirst({
                        orderBy: {
                            transaction_version: 'desc'
                        }
                    })

                    await this.prisma.globalSyncController.update({
                        data: {
                            last_sync_transaction_verision: campaignLast.transaction_version.toString()
                        },
                        where: {
                            id: lastSync.id
                        }
                    })
                }
            } catch (error) {
                this.logger.error("🚀 ~ CampaignService ~ syncOnChainEvents ~ error:", error)
            }
        }
    }

    // Method to handle Twitter follow
    async twitterFollow(address: string) {
        let record = await this.prisma.campaignSocialRecords.findUnique({
            where: { address },
        });

        if (!record) {
            // Create a new record if it doesn't exist
            record = await this.prisma.campaignSocialRecords.create({
                data: {
                    address,
                    isTwitterFollow: true,
                },
            });
        } else {
            // Update the existing record
            record = await this.prisma.campaignSocialRecords.update({
                where: { address },
                data: {
                    isTwitterFollow: true,
                },
            });
        }

        return record;
    }

    async twitterRepost(address: string) {
        let record = await this.prisma.campaignSocialRecords.findUnique({
            where: { address },
        });

        if (!record) {
            // Create a new record if it doesn't exist
            record = await this.prisma.campaignSocialRecords.create({
                data: {
                    address,
                    isTwitterRepost: true,
                },
            });
        } else {
            // Update the existing record
            record = await this.prisma.campaignSocialRecords.update({
                where: { address },
                data: {
                    isTwitterRepost: true,
                },
            });
        }

        return record;
    }

    // Method to handle Discord join
    async discordJoin(address: string) {
        let record = await this.prisma.campaignSocialRecords.findUnique({
            where: { address },
        });

        if (!record) {
            // Create a new record if it doesn't exist
            record = await this.prisma.campaignSocialRecords.create({
                data: {
                    address,
                    isDiscordJoined: true,
                },
            });
        } else {
            // Update the existing record
            record = await this.prisma.campaignSocialRecords.update({
                where: { address },
                data: {
                    isDiscordJoined: true,
                },
            });
        }

        return record;
    }

    // Method to fetch social records by address
    async getSocialRecords(address: string) {
        return this.prisma.campaignSocialRecords.findUnique({
            where: { address },
        });
    }

    async registerCampaign(address: string) {
        const record = await this.prisma.campaignUser.findFirst({
            where: { address },
        });

        if (!record) {
            return await this.prisma.campaignUser.create({ data: { address } })
        }
    }

    async getCampaignInfo(address: string) {
        const result = await this.prisma.campaignUser.findFirst({
            where: { address }
        });
        return result;
    }

    private isFunctionOn(flag: string): boolean {
        return flag === 'ON'
    }
}