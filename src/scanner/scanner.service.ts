import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Account, Aptos, AptosConfig, Ed25519Account, Ed25519PrivateKey, EntryFunction, InputViewFunctionData, Network, TransactionPayload } from '@aptos-labs/ts-sdk';
import axios from 'axios';
import { APTOS_ADDRESS, CHECK_LIQUIDATION_FUNC_PATH, ETH_COINSTORE, ETH_LONG_WrapperPositionConfig, getTableHandle, moduleAddress, ORDER_RECORD_PAIR_LIST, ORDER_RECORD_TABLE_HANDLE, POSITION_RECORDS_TABLE_HANDLE, SIDE_LONG, SIDE_SHORT, USDC_COINSTORE } from 'src/utils/helper';
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
    async handleSyncOrderRecords() {
        // await this.syncOnChainOrderRecords();
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleSyncPositionData() {
        // await this.syncOnChainPositionRecords();
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async handleCheckLiquidation() {
        await this.checkLiquidation();
    }

    async checkLiquidation() {
        const temp = {
            liquidation_threshold: ETH_LONG_WrapperPositionConfig.liquidation_threshold
        }
        const payload: InputViewFunctionData = {
            function: CHECK_LIQUIDATION_FUNC_PATH,
            typeArguments: [],
            functionArguments: [temp,]
        };

        const chainId = (await aptos.view({ payload }))[0];
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

    async syncOnChainPositionRecords() {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();

        try {
            const result = await Promise.all(POSITION_RECORDS_TABLE_HANDLE.map(async pair => {
                await this.fetchPositionRecords(pair, pHeight);
            }));
        } catch (error) {
            this.logger.error(error);
        }
    }

    async syncOnChainOrderRecords() {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();

        try {
            const result = await Promise.all(ORDER_RECORD_TABLE_HANDLE.map(async pair => {
                await this.fetchOrderRecordTableIncrease(pair, iHeight);
                await this.fetchOrderRecordTableDecrease(pair, dHeight);
            }));
        } catch (error) {
            this.logger.error(error);
        }
    }

    async fetchPositionRecords(pair: any, pHeight: string) {
        const result = await aptos.getTableItemsData({
            minimumLedgerVersion: Number(pHeight),
            options: {
                where: {
                    table_handle: { _eq: pair.tableHandle },
                    transaction_version: { _gt: pHeight }
                },
                orderBy: [{ transaction_version: 'desc' }],
            },
        });
        console.log("🚀 ~ ScannerService ~ fetchPositionRecords ~ tableHandle:", pair.tableHandle)
        console.log("🚀 ~ ScannerService ~ fetchPositionRecords ~ result:", result)
        const updatedDecResponse = result.map(item => ({
            ...item,
            vault: pair.vault,
            symbol: pair.symbol,
            direction: pair.direction,
        }))
        const sortedData: any[] = updatedDecResponse.sort((a, b) => {
            const dateA = new Date(a.transaction_version).getTime()
            const dateB = new Date(b.transaction_version).getTime()
            return dateB - dateA
        })
        if (sortedData.length > 0) {
            await this.prisma.updateGlobalSyncParams(sortedData[0].transaction_version.toString(), 'POSITION_RECORD')
        }
        this.prisma.savePositionRecords(sortedData)

    }

    async fetchOrderRecordTableIncrease(pair: any, iHeight: string) {
        const increase_handle = pair.open_orders
        const inc_response = await aptos.getTableItemsData({
            minimumLedgerVersion: Number(iHeight),
            options: {
                where: {
                    table_handle: { _eq: increase_handle },
                    transaction_version: { _gte: iHeight }
                },
                orderBy: [{ transaction_version: 'desc' }],
            },
        });

        const updatedIncResponse = inc_response.map(item => ({
            ...item,
            order_type: 'increase',
            vault: pair.vault,
            symbol: pair.symbol,
            direction: pair.direction,
        }))

        const nullList = updatedIncResponse.filter((item) => item.decoded_value === null)

        if (nullList.length > 0) {
            this.prisma.updateIncCancelOrderRecords(nullList)
        }

        const notNullList = updatedIncResponse.filter((item) => item.decoded_value !== null)

        const sortedData: any[] = notNullList.sort((a, b) => {
            const dateA = new Date(a.transaction_version).getTime()
            const dateB = new Date(b.transaction_version).getTime()
            return dateB - dateA
        })
        if (sortedData.length > 0) {
            await this.prisma.updateGlobalSyncParams(sortedData[0].transaction_version.toString(), 'INCREASE_ORDER_RECORD')
        }
        this.prisma.saveIncreaseOrderRecord(sortedData)
    }

    async fetchOrderRecordTableDecrease(pair: any, dHeight: string) {
        const decrease_handle = pair.decrease_orders
        const dec_response = await aptos.getTableItemsData({
            minimumLedgerVersion: Number(dHeight),
            options: {
                where: {
                    table_handle: { _eq: decrease_handle },
                },
                orderBy: [{ transaction_version: 'desc' }],
            },
        });
        const updatedDecResponse = dec_response.map(item => ({
            ...item,
            order_type: 'decrease',
            vault: pair.vault,
            symbol: pair.symbol,
            direction: pair.direction,
        }));

        const nullList = updatedDecResponse.filter((item) => item.decoded_value === null)

        if (nullList.length > 0) {
            this.prisma.updateDecCancelOrderRecords(nullList)
        }

        const notNullList = updatedDecResponse.filter((item) => item.decoded_value !== null)

        const sortedData: any[] = notNullList.sort((a, b) => {
            const dateA = new Date(a.transaction_version).getTime()
            const dateB = new Date(b.transaction_version).getTime()
            return dateB - dateA
        })

        if (sortedData.length > 0) {
            await this.prisma.updateGlobalSyncParams(sortedData[0].transaction_version.toString(), 'DECREASE_ORDER_RECORD')
        }
        this.prisma.saveDecreaseOrderRecord(sortedData)
    }


    async manualSync() {
        await this.syncOnChainOrderRecords();
    }
}

