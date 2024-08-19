import { APTOS_COIN } from '@aptos-labs/ts-sdk';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { aptos, MODULE_ADDRESS } from 'src/main';
import { PrismaService } from 'src/prisma/prisma.service';
import { DIRECTION, PAIRS, SymbolList, TYPES, VaultList } from 'src/utils/helper';

@Injectable()
export class OrderOrPositionService {

    constructor(private readonly prisma: PrismaService) {

    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleAggregateFeeData() {
        await this.aggregateFeeData();
    }

    async aggregateFeeData() {
        Promise.all(PAIRS.map((pair: any) => {
            this.getAggregateData(pair.vault, pair.symbol, pair.direction)
        }))
    }

    async getAggregateData(vault: string, symbol: string, direction: string) {
        const eightHoursAgo = Math.floor(Date.now() / 1000) - 8 * 60 * 60;

        const records = await this.prisma.positionRecord.findMany({
            where: {
                vault,
                symbol,
                direction,
                // open_timestamp: {
                //     gte: eightHoursAgo.toString(),
                // },
            },
        });

        const averageFundingFee = this.calculateAverage(
            records,
            'funding_fee_value',
            'funding_fee_is_positive',
        );

        const averageFundingRate = this.calculateAverage(
            records,
            'last_funding_rate',
            'last_funding_is_positive',
        );

        const averageReservingRate = this.calculateAverage(
            records,
            'last_reserving_rate',
        );

        await this.prisma.aggregatePositionRecord.create({
            data: {
                vault,
                symbol,
                direction,
                average_funding_fee: averageFundingFee.toString(),
                average_funding_rate: averageFundingRate.toString(),
                average_reserving_rate: averageReservingRate.toString(),
            },
        });
    }
    async syncHandles() {
        for (const type of TYPES) {
            for (const vault of VaultList) {
                for (const symbol of SymbolList) {
                    for (const direction of DIRECTION) {
                        let orderAddtional = type === 'PositionRecord' ? '' : `,${APTOS_COIN}`
                        const result = await aptos.getAccountResource({
                            accountAddress: MODULE_ADDRESS,
                            resourceType: `${MODULE_ADDRESS}::market::${type}<${vault.tokenAddress},${symbol.tokenAddress},${direction.address}${orderAddtional}>`
                        })
                        const record = await this.prisma.positionOrderHandle.findFirst({
                            where: {
                                vault: vault.name,
                                symbol: symbol.tokenName,
                                direction: direction.name
                            }
                        })
                        if (type === 'PositionRecord') {
                            let handle = result?.positions?.handle
                            if (handle && handle.length !== 66) {
                                handle = '0x'.concat('0'.repeat(66 - handle.length)).concat(handle.slice(2))
                            }
                            if (record) {
                                await this.prisma.positionOrderHandle.update({
                                    data: {
                                        vault: vault.name,
                                        symbol: symbol.tokenName,
                                        direction: direction.name,
                                        position_handle: handle
                                    },
                                    where: { id: record.id }
                                })
                            } else {//create
                                await this.prisma.positionOrderHandle.create({
                                    data: {
                                        vault: vault.name,
                                        symbol: symbol.tokenName,
                                        direction: direction.name,
                                        position_handle: handle
                                    }
                                })
                            }
                            console.log(`🚀 ~ syncHandles position ~ ${vault.name} ${symbol.tokenName} ${direction.name} ${handle}`)

                        } else { // order record
                            let increase_order_handle = result?.open_orders?.handle
                            let decrease_order_handle = result?.decrease_orders?.handle
                            if (increase_order_handle && increase_order_handle.length !== 66) {
                                increase_order_handle = '0x'.concat('0'.repeat(66 - increase_order_handle.length)).concat(increase_order_handle.slice(2))
                            }
                            if (decrease_order_handle && decrease_order_handle.length !== 66) {
                                decrease_order_handle = '0x'.concat('0'.repeat(66 - decrease_order_handle.length)).concat(decrease_order_handle.slice(2))
                            }
                            if (record) {
                                await this.prisma.positionOrderHandle.update({
                                    data: {
                                        vault: vault.name,
                                        symbol: symbol.tokenName,
                                        direction: direction.name,
                                        increase_order_handle,
                                        decrease_order_handle
                                    },
                                    where: { id: record.id }
                                })
                            } else {//create
                                await this.prisma.positionOrderHandle.create({
                                    data: {
                                        vault: vault.name,
                                        symbol: symbol.tokenName,
                                        direction: direction.name,
                                        increase_order_handle,
                                        decrease_order_handle
                                    }
                                })
                            }
                            console.log(`🚀 ~ syncHandles order ~ ${vault.name} ${symbol.tokenName} ${direction.name} ${increase_order_handle} ${decrease_order_handle}`)
                        }
                    }
                }
            }
        }
    }

    async findAllUserPositions(owner: string, vault: string, symbol: string) {
        return this.prisma.positionRecord.findMany({
            where: {
                owner,
                vault,
                symbol,
            },
            orderBy: {
                transaction_version: 'desc',
            },
        });
    }

    async findDecreaseOrders(owner: string, vault: string, symbol: string) {
        return this.prisma.decreaseOrderRecord.findMany({
            where: {
                owner,
                vault,
                symbol,
            },
            orderBy: {
                transaction_version: 'desc',
            },
        });
    }

    async findIncreaseOrders(owner: string, vault: string, symbol: string) {
        return this.prisma.increaseOrderRecord.findMany({
            where: {
                owner,
                vault,
                symbol,
            },
            orderBy: {
                transaction_version: 'desc',
            },
        });
    }


    private calculateAverage(records: any[], valueField: string, positiveField?: string): string {
        if (records.length === 0) return '0';

        let sum = BigInt(0);
        records.forEach(record => {
            let value = BigInt(record[valueField]);
            if (positiveField) {
                const isPositive = record[positiveField];
                value = isPositive ? value : -value;
            }
            sum += value;
        });

        const average = sum / BigInt(records.length);
        return average.toString();

    }

    async getLatestAggregateData(vault: string, symbol: string) {
        const longResult = await this.prisma.aggregatePositionRecord.findFirst({
            where: {
                vault,
                symbol,
                direction: "LONG",
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const shortResult = await this.prisma.aggregatePositionRecord.findFirst({
            where: {
                vault,
                symbol,
                direction: "SHORT",
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { longResult, shortResult }
    }

}
