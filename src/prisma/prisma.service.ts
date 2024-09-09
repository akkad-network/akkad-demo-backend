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
                    write_set_change_index: item.write_set_change_index,
                };
            });
        }

        if (!parsedList || parsedList.length === 0) {
            return null;
        }

        await this.positionHistoryRecords.createMany({ data: parsedList });

        for (const record of parsedList) {
            const existingOrder = await this.positionRecord.findFirst({
                where: {
                    order_id: record.order_id,
                    owner: record.owner,
                    vault: record.vault,
                    symbol: record.symbol,
                    direction: record.direction,
                    table_handle: record.table_handle,
                    key: record.key
                }
            })

            if (existingOrder) {
                await this.positionRecord.updateMany({
                    data: record,
                    where: {
                        order_id: record.order_id,
                        owner: record.owner,
                        vault: record.vault,
                        symbol: record.symbol,
                        direction: record.direction,
                        table_handle: record.table_handle,
                        key: record.key
                    }
                })
            } else {
                await this.positionRecord.create({
                    data: record
                })
            }
        }

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

        const decRecord = await this.globalSyncController.findFirst({
            where: {
                sync_type: 'DECREASE_ORDER_RECORD'
            }
        })

        const referrerRecord = await this.globalSyncController.findFirst({
            where: {
                sync_type: 'REFERRER_RECORD'
            }
        })
        let pHeight = '5653799813'
        let iHeight = '5653799813'
        let dHeight = '5653799813'
        let rHeight = '5653799813'

        if (positionRecord) {
            pHeight = positionRecord.last_sync_transaction_verision
        }
        if (incRecord) {
            iHeight = incRecord.last_sync_transaction_verision
        }
        if (decRecord) {
            dHeight = decRecord.last_sync_transaction_verision
        }
        if (referrerRecord) {
            rHeight = referrerRecord.last_sync_transaction_verision
        }

        return { pHeight, iHeight, dHeight, rHeight }
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
                    fee: "0",
                    executed: true,
                    created_at: new Date(0),
                    open_amount: "0",
                    reserve_amount: "0",
                    limited_index_price: "0",
                    collateral_price_threshold: "0",
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
                    executed: item.decoded_value?.executed,
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

        for (const record of parsedList) {
            const existingOrder = await this.increaseOrderRecord.findFirst({
                where: {
                    order_id: record.order_id,
                    owner: record.owner,
                    vault: record.vault,
                    symbol: record.symbol,
                    direction: record.direction,
                    table_handle: record.table_handle,
                    key: record.key
                }
            })
            if (existingOrder) {
                await this.increaseOrderRecord.updateMany({
                    data: record,
                    where: {
                        order_id: existingOrder.order_id,
                        owner: record.owner,
                        vault: record.vault,
                        symbol: record.symbol,
                        direction: record.direction,
                        table_handle: record.table_handle,
                        key: record.key,
                    }
                })
            } else {
                await this.increaseOrderRecord.create({
                    data: record
                })
            }
        }
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
                    decrease_amount: "0",
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
                    position_num: parseInt(item.decoded_value.position_num, 10),
                    order_type: item.order_type,
                    vault: item.vault,
                    symbol: item.symbol,
                    direction: item.direction,
                    fee: item.decoded_value.fee?.value || "CANCEL",
                    executed: item.decoded_value.executed,
                    created_at: new Date(parseInt(item.decoded_value.created_at, 10) * 1000),
                    take_profit: item.decoded_value.take_profit || false,
                    decrease_amount: item.decoded_value.decrease_amount || 'CANCEL',
                    limited_index_price: item.decoded_value.limited_index_price.price.value || 'CANCEL',
                    collateral_price_threshold: item.decoded_value.collateral_price_threshold?.value || 'CANCEL',
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

        for (const record of parsedList) {
            const existingOrder = await this.decreaseOrderRecord.findFirst({
                where: {
                    order_id: record.order_id,
                    owner: record.owner,
                    vault: record.vault,
                    symbol: record.symbol,
                    direction: record.direction
                }
            })
            if (existingOrder) {
                await this.decreaseOrderRecord.updateMany({
                    data: record,
                    where: {
                        order_id: existingOrder.order_id,
                        owner: record.owner,
                        vault: record.vault,
                        symbol: record.symbol,
                        direction: record.direction
                    }
                })
            } else {
                await this.decreaseOrderRecord.create({
                    data: record
                })
            }
        }
    }
}
