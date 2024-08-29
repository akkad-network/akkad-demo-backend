import { APTOS_COIN } from '@aptos-labs/ts-sdk';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PriceFeederRecord } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { aptos, MODULE_ADDRESS } from 'src/main';
import { PrismaService } from 'src/prisma/prisma.service';
import { DIRECTION, PAIRS, SymbolList, TYPES, VaultList } from 'src/utils/helper';
@Injectable()
export class OrderOrPositionService {

    constructor(private readonly prisma: PrismaService) {

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
    async getLast8HoursReservingRateAver(vault: string) {
        const now = new Date();
        const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

        const records = await this.prisma.vaultConfig.findMany({
            where: {
                vault: vault,
                // createAt: {
                //     gte: eightHoursAgo,
                //     lte: now,
                // },
            },
            select: {
                acc_reserving_rate: true,
            },
        });
        if (records.length === 0) {
            return 0
        }
        const total = records.reduce((sum, record) => {
            const value = new Decimal(record.acc_reserving_rate);
            return sum.plus(value);
        }, new Decimal(0));
        const averageReserving = total.dividedBy(records.length);
        return { averageReserving }
    }



    async getLast8HoursFundingRateAver(symbol: string) {
        const now = new Date();
        const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

        const longRecords = await this.prisma.symbolDirectionConfig.findMany({
            where: {
                symbol: symbol,
                direction: 'LONG'
                // createAt: {
                //     gte: eightHoursAgo,
                //     lte: now,
                // },
            },
            select: {
                acc_funding_rate_flag: true,
                acc_funding_rate_value: true,
            },
        });



        const totalLong = longRecords.reduce((sum, record) => {
            const value = new Decimal(record.acc_funding_rate_value);
            return sum.plus(record.acc_funding_rate_flag ? value : value.neg());
        }, new Decimal(0));
        const averageLong = longRecords.length === 0 ? 0 : totalLong.dividedBy(longRecords.length);


        const shortRecords = await this.prisma.symbolDirectionConfig.findMany({
            where: {
                symbol: symbol,
                direction: 'SHORT'
                // createAt: {
                //     gte: eightHoursAgo,
                //     lte: now,
                // },
            },
            select: {
                acc_funding_rate_flag: true,
                acc_funding_rate_value: true,
            },
        });

        const totalShort = shortRecords.reduce((sum, record) => {
            const value = new Decimal(record.acc_funding_rate_value);
            return sum.plus(record.acc_funding_rate_flag ? value : value.neg());
        }, new Decimal(0));
        const averageShort = shortRecords.length === 0 ? 0 : totalShort.dividedBy(shortRecords.length);

        return { averageLong, averageShort }
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

    async fetchAllVaultConfig() {
        await this.prisma.vaultConfig.findMany({
            where: {},
            orderBy: {
                id: 'desc'
            }
        })
    }

    async fetchAllSymbolConfig() {
        return await this.prisma.symbolDirectionConfig.findMany({
            where: {},
            orderBy: {
                id: 'desc'
            }
        })
    }

    async fetchAllLpTokenRecords() {
        return await this.prisma.lPTokenPriceRecords.findMany({
            where: {},
            orderBy: {
                id: 'desc'
            }
        })
    }


    async get7DaysLpTokenApr() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);  // 7天前的时间

        const closestRecord = await this.prisma.lPTokenPriceRecords.findFirst({
            where: {
                createAt: {
                    lte: sevenDaysAgo,
                },
            },
            orderBy: {
                createAt: 'desc',
            },
        });

        const firstRecord = await this.prisma.lPTokenPriceRecords.findFirst({
            orderBy: {
                createAt: 'asc',
            },
        });

        if (!closestRecord && !firstRecord) {
            return { changeRate: 0 };
        }

        const latestRecord = await this.prisma.lPTokenPriceRecords.findFirst({
            orderBy: {
                createAt: 'desc',
            },
        });

        const initialPrice = closestRecord ? parseFloat(closestRecord.price) : parseFloat(firstRecord.price);
        const latestPrice = parseFloat(latestRecord.price);

        const changeRate = ((latestPrice - initialPrice) / initialPrice) * 100;

        return { changeRate };
    }

    async fetch24HoursChange(symbol: string) {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const latestRecord = await this.prisma.priceFeederRecord.findFirst({
            where: { symbol },
            orderBy: { createAt: 'desc' },
        });

        if (!latestRecord) {
            throw new Error('No price records found for the given symbol.');
        }

        const pastRecord = await this.prisma.priceFeederRecord.findFirst({
            where: {
                symbol,
                createAt: { lte: twentyFourHoursAgo },
            },
            orderBy: { createAt: 'desc' },
        });

        if (!pastRecord) {
            const firstRecord = await this.prisma.priceFeederRecord.findFirst({
                where: { symbol },
                orderBy: { createAt: 'asc' },
            });

            if (!firstRecord) {
                throw new Error('No past price records found for the given symbol.');
            }
            return this.calculateChangeRate(firstRecord, latestRecord);
        }

        return this.calculateChangeRate(pastRecord, latestRecord);
    }


    async fetchAllSymbol24HoursChange() {
        const symbols = SymbolList.map((item) => {
            return item.tokenSymbol
        })
        console.log("🚀 ~ OrderOrPositionService ~ symbols ~ symbols:", symbols)
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const latestRecords = await this.prisma.priceFeederRecord.findMany({
            where: { symbol: { in: symbols } },
            orderBy: { createAt: 'desc' },
            distinct: ['symbol'],
        });

        if (latestRecords.length === 0) {
            throw new Error('No price records found for the given symbols.');
        }

        const pastRecords = await this.prisma.priceFeederRecord.findMany({
            where: {
                symbol: { in: symbols },
                createAt: { lte: twentyFourHoursAgo },
            },
            orderBy: { createAt: 'desc' },
            distinct: ['symbol'],
        });

        let changeRates: any[] = []

        for (const latestRecord of latestRecords) {
            const pastRecord = pastRecords.find(record => record.symbol === latestRecord.symbol);

            if (!pastRecord) {
                const firstRecord = await this.prisma.priceFeederRecord.findFirst({
                    where: { symbol: latestRecord.symbol },
                    orderBy: { createAt: 'asc' },
                });

                if (!firstRecord) {
                    throw new Error(`No past price records found for symbol ${latestRecord.symbol}.`);
                }
                return {
                    symbol: latestRecord.symbol,
                    changeRate: this.calculateChangeRate(firstRecord, latestRecord),
                };
            }

            changeRates.push({
                symbol: latestRecord.symbol,
                changeRate: this.calculateChangeRate(pastRecord, latestRecord),
            })
        }

        return changeRates;
    }

    private calculateChangeRate(pastRecord: PriceFeederRecord, latestRecord: PriceFeederRecord): number {
        const pastPrice = parseFloat(pastRecord.price);
        const latestPrice = parseFloat(latestRecord.price);
        return ((latestPrice - pastPrice) / pastPrice) * 100;
    }
}
