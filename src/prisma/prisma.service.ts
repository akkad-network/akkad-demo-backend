import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    async savePositionRecords(positionRecords: any) {
        let parsedList: any;
        if (positionRecords && positionRecords.length > 0) {
            parsedList = positionRecords.map((item: any) => {
                return {
                    order_id: parseInt(item.decoded_key.id, 10),
                    owner: item.decoded_key.owner,
                    vault: item.vault,
                    symbol: item.symbol,
                    direction: item.direction,
                    closed: item.decoded_value.closed,
                    reserved: item.decoded_value.reserved.value,
                    collateral: item.decoded_value.collateral.value,
                    position_size: item.decoded_value.position_size.value,
                    open_timestamp: item.decoded_value.open_timestamp,
                    position_amount: item.decoded_value.position_amount,
                    funding_fee_value: item.decoded_value.funding_fee_value.value.value,
                    funding_fee_is_positive: item.decoded_value.funding_fee_value.is_positive,
                    last_funding_rate: item.decoded_value.last_funding_rate.value.value,
                    last_funding_is_positive: item.decoded_value.last_funding_rate.is_positive,
                    is_positive: item.decoded_value.last_funding_rate.is_positive,
                    last_reserving_rate: item.decoded_value.last_reserving_rate.value,
                    reserving_fee_amount: item.decoded_value.reserving_fee_amount.value,
                    key: item.key,
                    table_handle: item.table_handle,
                    transaction_version: item.transaction_version.toString(),
                    leverage_number: (BigInt(item.decoded_value.reserved.value) / BigInt(item.decoded_value.collateral.value)).toString(),
                    write_set_change_index: item.write_set_change_index,
                };
            });
        }

        if (!parsedList || parsedList.length === 0) {
            return null;
        }

        const existingRecords = await this.positionRecord.findMany({
            where: {
                transaction_version: {
                    in: parsedList.map((item: any) => item.transaction_version),
                },
            },
        });

        const newRecords = parsedList.filter(
            (item: any) =>
                !existingRecords.some((existingRecord: any) => existingRecord.transaction_version === item.transaction_version),
        );

        if (newRecords.length === 0) {
            return null;
        }

        return this.positionRecord.createMany({ data: newRecords });
    }

    async findRecordsHeight() {
        const positionRecord = await this.globalSyncController.findFirst({
            where: {
                sync_type: 'POSITION_RECORD'
            }
        })
        const incRecord = await this.globalSyncController.findFirst({
            where: {
                sync_type: 'INCREASE_ORDER_RECORD'
            }
        })

        const devRecord = await this.globalSyncController.findFirst({
            where: {
                sync_type: 'DECREASE_ORDER_RECORD'
            }
        })

        const pHeight = positionRecord.last_sync_transaction_verision
        const iHeight = incRecord.last_sync_transaction_verision
        const dHeight = devRecord.last_sync_transaction_verision

        return { pHeight, iHeight, dHeight }
    }

    async updateGlobalSyncParams(last_sync: string, sync_type: string) {
        const existingRecord = await this.globalSyncController.findFirst({
            where: {
                sync_type: sync_type,
            },
        });

        if (!existingRecord) {
            return this.globalSyncController.create({
                data: {
                    last_sync_transaction_verision: last_sync,
                    sync_type: sync_type,
                },
            });
        }

        if (existingRecord.last_sync_transaction_verision >= last_sync) {
            return null;
        }

        return this.globalSyncController.update({
            where: {
                id: existingRecord.id,
            },
            data: {
                last_sync_transaction_verision: last_sync,
            },
        });
    }

    async updateIncCancelOrderRecords(orderRecords: any[]) {

        for (const item of orderRecords) {
            const { table_handle, key, transaction_version } = item;

            await this.increaseOrderRecord.updateMany({
                where: {
                    table_handle,
                    key,
                },
                data: {
                    fee: '',
                    executed: true,
                    created_at: new Date(0),
                    open_amount: transaction_version.toString(),
                    reserve_amount: '',
                    limited_index_price: '',
                    collateral_price_threshold: '',
                    write_set_change_index: 0,
                    status: 'CANCEL',
                    createdAt: new Date(0),
                },
            });
        }
    }

    async saveIncreaseOrderRecord(orderRecords: any[]) {
        let parsedList: any;
        if (orderRecords && orderRecords.length > 0) {
            parsedList = orderRecords.map((item: any) => {
                return {
                    order_id: parseInt(item.decoded_key.id, 10),
                    owner: item.decoded_key.owner,
                    order_type: item.order_type,
                    vault: item.vault,
                    symbol: item.symbol,
                    direction: item.direction,
                    fee: item.decoded_value?.fee?.value || "CANCEL",
                    executed: item.decoded_value?.executed || true,
                    created_at: new Date(parseInt(item.decoded_value?.created_at || 0, 10) * 1000),
                    open_amount: item.decoded_value?.open_amount || "CANCEL",
                    reserve_amount: item.decoded_value?.reserve_amount || "CANCEL",
                    limited_index_price: item.decoded_value?.limited_index_price.price.value || 'CANCEL',
                    collateral_price_threshold: item.decoded_value?.collateral_price_threshold?.value || 'CANCEL',
                    key: item.key,
                    table_handle: item.table_handle,
                    transaction_version: item.transaction_version.toString(),
                    write_set_change_index: item.write_set_change_index,
                };
            });
        }

        if (!parsedList || parsedList.length === 0) {
            return null;
        }

        const existingRecords = await this.increaseOrderRecord.findMany({
            where: {
                transaction_version: {
                    in: parsedList.map((item: any) => item.transaction_version),
                },
            },
        });

        const nonNullParsedList = parsedList.filter((item: any) => item.decoded_value !== null)

        const newRecords = nonNullParsedList.filter(
            (item: any) =>
                !existingRecords.some((existingRecord: any) => existingRecord.transaction_version === item.transaction_version),
        );

        if (newRecords.length === 0) {
            return null;
        }

        return this.increaseOrderRecord.createMany({ data: newRecords });
    }

    async updateDecCancelOrderRecords(orderRecords: any[]) {
        for (const item of orderRecords) {
            const { table_handle, key, transaction_version } = item;

            await this.decreaseOrderRecord.updateMany({
                where: {
                    table_handle,
                    key,
                },
                data: {
                    fee: '0',
                    executed: true,
                    created_at: new Date(0),
                    take_profit: false,
                    decrease_amount: transaction_version.toString(),
                    limited_index_price: '',
                    collateral_price_threshold: '',
                    write_set_change_index: 0,
                    status: 'CANCEL',
                    createdAt: new Date(0),
                },
            });
        }
    }


    async saveDecreaseOrderRecord(orderRecords: any) {
        let parsedList: any;
        if (orderRecords && orderRecords.length > 0) {
            parsedList = orderRecords.map((item: any) => {
                return {
                    order_id: parseInt(item.decoded_key.id, 10),
                    owner: item.decoded_key.owner,
                    order_type: item.order_type,
                    vault: item.vault,
                    symbol: item.symbol,
                    direction: item.direction,
                    fee: item.decoded_value.fee?.value,
                    executed: item.decoded_value.executed,
                    created_at: new Date(parseInt(item.decoded_value.created_at, 10) * 1000),
                    take_profit: item.decoded_value.take_profit || false,
                    decrease_amount: item.decoded_value.decrease_amount || '',
                    limited_index_price: item.decoded_value.limited_index_price.price.value,
                    collateral_price_threshold: item.decoded_value.collateral_price_threshold?.value,
                    key: item.key,
                    table_handle: item.table_handle,
                    transaction_version: item.transaction_version.toString(),
                    write_set_change_index: item.write_set_change_index,
                };
            });
        }

        if (!parsedList || parsedList.length === 0) {
            return null;
        }

        const existingRecords = await this.decreaseOrderRecord.findMany({
            where: {
                transaction_version: {
                    in: parsedList.map((item: any) => item.transaction_version),
                },
            },
        });

        const newRecords = parsedList.filter(
            (item: any) =>
                !existingRecords.some((existingRecord: any) => existingRecord.transaction_version === item.transaction_version),
        );

        if (newRecords.length === 0) {
            return null;
        }

        return this.decreaseOrderRecord.createMany({ data: newRecords });
    }
}
