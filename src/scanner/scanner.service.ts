import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Account, Aptos, AptosConfig, Ed25519Account, Ed25519PrivateKey, EntryFunction, Network, TransactionPayload } from '@aptos-labs/ts-sdk';
import axios from 'axios';
import { APTOS_ADDRESS, getTableHandle, moduleAddress, ORDER_RECORD_PAIR_LIST } from 'src/utils/helper';
import { aptos, singer } from 'src/main';

@Injectable()
export class ScannerService {
    private readonly aptos: Aptos
    private readonly logger = new Logger(ScannerService.name)
    private readonly contractAddress: string = "0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387";
    private readonly priceIds: string[] = [
        "0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e",
        "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722",
        "0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588",
        "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
        "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6"
    ];

    constructor(private readonly prisma: PrismaService) {

    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handlePriceFeeder() {
        await this.updateFeed();
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleCron() {
        // await this.syncAptosBlockchain();
    }

    async updateFeed(): Promise<void> {
        const vaas = await Promise.all(this.priceIds.map(id => this.fetchVaa(id)));
        const vasBytes = vaas.map(vaa => Array.from(Buffer.from(vaa, 'hex')));
        const transaction = await aptos.transaction.build.simple({
            sender: singer.accountAddress,
            data: {
                function: `${this.contractAddress}::pyth::update_price_feeds_with_funder`,
                typeArguments: [],
                functionArguments: [vasBytes],
            },
        });

        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: singer,
            transaction,
        });

        this.logger.log('Transaction submitted:', committedTransaction.toString());
    }

    async fetchVaa(priceId: string): Promise<string> {
        try {
            const response = await axios.get(`https://hermes-beta.pyth.network/v2/updates/price/latest?ids%5B%5D=${priceId}`);
            return response.data.binary.data[0];
        } catch (error) {
            console.error(`Error fetching VAA for priceId ${priceId}:`, error);
            throw error;
        }
    }

    async syncAptosBlockchain() {
        try {
            const wrapperTableHandles = await Promise.all(ORDER_RECORD_PAIR_LIST.map(pair => this.fetchOrderRecordHandles(pair)))

            if (wrapperTableHandles && wrapperTableHandles.length > 0) {
                const result = await Promise.all(wrapperTableHandles.map(table =>
                    this.fetchOrderRecordTable(table)
                ))
            }
        } catch (error) {
            this.logger.error(error)
        }
    }

    async fetchOrderRecordHandles(resource: any) {
        try {
            const { result } = await getTableHandle(
                moduleAddress,
                resource.address as APTOS_ADDRESS
            )
            return { ...result, ...resource }
        } catch (error: any) {
            this.logger.error(111, error)
        }
    }

    async fetchOrderRecordTable(tableEntity: any) {
        const creation_num = tableEntity.creation_num
        const increase_handle = tableEntity.open_orders.handle
        const decrease_handle = tableEntity.decrease_orders.handle
        if (creation_num > 0) {
            const inc_response = await aptos.getTableItemsData({
                options: {
                    where: {
                        table_handle: { _eq: increase_handle },
                    },
                    orderBy: [{ transaction_version: 'desc' }],
                    limit: 10
                },
            });
            const dec_response = await aptos.getTableItemsData({
                options: {
                    where: {
                        table_handle: { _eq: decrease_handle },
                    },
                    orderBy: [{ transaction_version: 'desc' }],
                    limit: 10
                },
            });
            inc_response.map(item => ({
                ...item,
                direction: tableEntity.direction,
                type: 'INC'
            }))
            dec_response.map(item => ({
                ...item,
                direction: tableEntity.direction,
                type: 'DEC'
            }))
            const combinedData = [
                ...inc_response,
                ...dec_response
            ]
            const sortedData: any[] = combinedData.sort((a, b) => {
                const dateA = new Date(a.transaction_version).getTime()
                const dateB = new Date(b.transaction_version).getTime()
                return dateB - dateA
            })
            this.prisma.saveOrderRecord(sortedData)
        }
    }

    async manualSync() {
        await this.syncAptosBlockchain();
    }
}

// {
//     creation_num: '0',
//     decrease_orders: {
//       handle: '0xa18f80c2798b9a90f1ae3dbaee03a097659e2e8900495c221ae4a4da2ac9bba7'
//     },
//     open_orders: {
//       handle: '0xe6b52c74205adb5a906d8f0b5d7ce004e35c15e5e30f76fc2d0a7dbc07f5d654'
//     },
//     address: '0x87e95448bc9088569ed1f9b724a1ec679a187a1c80ff49b52c305318956c4bb7::market::OrderRecord<0x1::aptos_coin::AptosCoin,0x1::aptos_coin::AptosCoin,0x87e95448bc9088569ed1f9b724a1ec679a187a1c80ff49b52c305318956c4bb7::pool::SHORT,0x1::aptos_coin::AptosCoin>',
//     direction: 'SHORT',
//     vault: 'APTOS',
//     symbol: 'APTOS'
//   }