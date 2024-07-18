import { Injectable } from '@nestjs/common';
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
}
