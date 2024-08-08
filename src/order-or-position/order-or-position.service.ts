import { Injectable } from '@nestjs/common';
import { AggregatePositionRecord } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderOrPositionService {

    constructor(private readonly prisma: PrismaService) {

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
