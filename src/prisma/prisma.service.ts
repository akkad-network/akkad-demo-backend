/* eslint-disable prettier/prettier */
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

    async checkSaveOrderRecord(orderRecord: any) {
        await this.saveOrderRecord(orderRecord)
    }

    async saveOrderRecord(orderRecords: any) {
        let parsedList: any
        if (orderRecords && orderRecords.length > 0) {
            parsedList = orderRecords.map((item: any, index: number) => {
                return {
                    decoded_id: parseInt(item.decoded_key.id, 10),
                    decoded_key: item.decoded_key.owner,
                    fee: item.decoded_value.fee?.value,
                    executed: item.decoded_value.executed,
                    created_at: new Date(parseInt(item.decoded_value.created_at, 10) * 1000),
                    take_profit: item.decoded_value.take_profit || false,
                    open_amount: item.decoded_value.open_amount || "",
                    decrease_amount: item.decoded_value.decrease_amount || "",
                    reserve_amount: item.decoded_value.reserve_amount || "",
                    limited_index_price: item.decoded_value.limited_index_price.price.value,
                    limited_index_precision: item.decoded_value.limited_index_price.precision,
                    collateral: item.decoded_value.collateral?.value || "",
                    collateral_price_threshold: item.decoded_value.collateral_price_threshold?.value,
                    key: item.key,
                    table_handle: item.table_handle,
                    transaction_version: item.transaction_version.toString(),
                    write_set_change_index: item.write_set_change_index,
                }
            }
            )
        }
        if (parsedList === null || parsedList.length === 0) {
            return null
        }
        return this.orderRecord.createMany({ data: parsedList })
    }
}
