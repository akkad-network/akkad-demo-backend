import { OrderOrPositionService } from './../order-or-position/order-or-position.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Account, Aptos, APTOS_COIN, AptosConfig, Ed25519Account, Ed25519PrivateKey, EntryFunction, InputViewFunctionData, Network, TransactionPayload } from '@aptos-labs/ts-sdk';
import axios from 'axios';
import { CHECK_LIQUIDATION_FUNC_PATH, convertBackDecimal, convertDecimal, ETH_COINSTORE, ETH_LONG_WrapperPositionConfig, formatAptosDecimal, getSideAddress, getTableHandle, moduleAddress, PAIRS, SIDE_LONG, SIDE_SHORT, SymbolList, USDC_COINSTORE, VaultList, WrappedTokenConfigList } from 'src/utils/helper';
import { aptos, singer } from 'src/main';
import { DecreaseOrderRecord, IncreaseOrderRecord, PositionOrderHandle, PositionRecord } from '@prisma/client';

@Injectable()
export class ScannerService {
    private readonly aptos: Aptos
    private readonly logger = new Logger(ScannerService.name)
    private readonly priceFeedAddress: string = "0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387";
    private readonly contractAddress: string = "0x8d07663376c920257ab9f2bd8ef0cc5ed5f2264109a3d29fc2b6f8aafc5e875d";
    private readonly priceIds: any[] = [
        { name: "APTOS", address: "0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e" },
        { name: "USDT", address: "0x41f3625971ca2ed2263e78573fe5ce23e13d2558ed3f2e47ab0f84fb9e7ae722" },
        { name: "USDC", address: "0x1fc18861232290221461220bd4e2acd1dcdfbc89c84092c93c18bdc7756c1588" },
        { name: "BTC", address: "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b" },
        { name: "ETH", address: "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6" }
    ];

    constructor(private readonly prisma: PrismaService, private readonly orderOrPositionService: OrderOrPositionService) {

    }

    @Cron(CronExpression.EVERY_30_SECONDS)
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

    @Cron(CronExpression.EVERY_4_HOURS)
    async handleAggregateFeeData() {
        await this.aggregateFeeData();
    }


    async updateFeed(): Promise<void> {
        const vaas = await Promise.all(this.priceIds.map(pair => this.fetchVaa(pair.address)));
        const vasBytes = vaas.map(vaa => Array.from(Buffer.from(vaa.binary, 'hex')));
        const parsedPrices = vaas.map(vaa => vaa.parsed);
        await this.updateFeedToAptos(vasBytes)
        // await this.scanOrderRecords(parsedPrices)
        // await this.checkLiquidation(parsedPrices);
    }

    async fetchVaa(priceId: string): Promise<any> {
        try {
            const response = await axios.get(`https://hermes-beta.pyth.network/v2/updates/price/latest?ids%5B%5D=${priceId}`);
            return { binary: response.data.binary.data[0], parsed: response.data.parsed[0].price.price }
        } catch (error) {
            console.error(`Error fetching VAA for priceId ${priceId}:`, error);
            throw error;
        }
    }

    async updateFeedToAptos(vasBytes: number[][]) {
        const transaction = await aptos.transaction.build.simple({
            sender: singer.accountAddress,
            data: {
                function: `${this.priceFeedAddress}::pyth::update_price_feeds_with_funder`,
                typeArguments: [],
                functionArguments: [vasBytes],
            },
        });

        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: singer,
            transaction,
        });

        this.logger.log('Transaction submitted update price feed:', committedTransaction.toString());
    }

    async scanOrderRecords(prices: any[]) {
        const pricesList = prices.map((price, index) => {
            return { name: this.priceIds[index].name, price: convertDecimal(Number(price)) }
        })
        for (const pair of PAIRS) {
            const vaultName = pair.vault
            const symbolName = pair.symbol
            const direction = pair.direction
            const vaultPrice = pricesList.find((priceInfo) => priceInfo.name === vaultName).price
            const vaultPriceToBigInt = BigInt(vaultPrice)
            const vaultPriceToString = BigInt(vaultPrice).toString();
            const symbolPrice = pricesList.find((priceInfo) => priceInfo.name === symbolName).price
            const symbolPriceToBigInt = BigInt(symbolPrice)
            const symbolPriceToString = BigInt(symbolPrice).toString();
            let limited_index_price_params = null
            if (direction === 'LONG') {
                limited_index_price_params = {
                    gte: symbolPriceToBigInt
                }
            } else {
                limited_index_price_params = {
                    lte: symbolPriceToBigInt
                }
            }

            const symbolPriceBigInt = BigInt(symbolPriceToBigInt);
            const vaultPriceBigInt = BigInt(vaultPriceToBigInt);


            const allOrdersIncrease = await this.prisma.increaseOrderRecord.findMany({
                where: {
                    vault: vaultName,
                    symbol: symbolName,
                    direction: direction,
                    executed: false,
                    status: { not: null }
                }
            });

            const validOrdersIncrease = allOrdersIncrease.filter(order => {
                const limitedIndexPriceBigInt = BigInt(order.limited_index_price);
                const collateralPriceThresholdBigInt = BigInt(order.collateral_price_threshold);

                const limitedIndexPriceMatch = direction === 'LONG'
                    ? limitedIndexPriceBigInt >= symbolPriceBigInt
                    : limitedIndexPriceBigInt <= symbolPriceBigInt;

                const collateralPriceThresholdMatch = collateralPriceThresholdBigInt <= vaultPriceBigInt;

                return limitedIndexPriceMatch && collateralPriceThresholdMatch;
            });

            for (const order of validOrdersIncrease) {
                await this.executeIncreaseOrderRecords(order)
            }

            const allOrdersDecrease = await this.prisma.decreaseOrderRecord.findMany({
                where: {
                    vault: vaultName,
                    symbol: symbolName,
                    direction: direction,
                    executed: false,
                    status: { not: null }
                }
            });

            const validOrdersDecrease = allOrdersDecrease.filter(order => {
                const limitedIndexPriceBigInt = BigInt(order.limited_index_price);
                const collateralPriceThresholdBigInt = BigInt(order.collateral_price_threshold);

                let limitedIndexPriceMatch = false
                if (direction === 'LONG') {
                    if (order.take_profit) { // long tp
                        limitedIndexPriceMatch = symbolPriceBigInt >= limitedIndexPriceBigInt
                    } else { // long sl
                        limitedIndexPriceMatch = limitedIndexPriceBigInt >= symbolPriceBigInt
                    }
                } else { //short 
                    if (order.take_profit) { //short tp
                        limitedIndexPriceMatch = symbolPriceBigInt <= limitedIndexPriceBigInt
                    } else {//short sl
                        limitedIndexPriceMatch = symbolPriceBigInt >= limitedIndexPriceBigInt
                    }
                }

                const collateralPriceThresholdMatch = collateralPriceThresholdBigInt <= vaultPriceBigInt;

                return limitedIndexPriceMatch && collateralPriceThresholdMatch;
            });

            for (const order of validOrdersDecrease) {
                await this.executeDecreaseOrderRecords(order)
            }

        }

    }

    async executeIncreaseOrderRecords(order: IncreaseOrderRecord) {
        console.log("🚀 ~ ScannerService ~ executeOrderRecords increase ~ order:", order)
        const accountInfo = await aptos.account.getAccountInfo({ accountAddress: singer.accountAddress })
        const seqNumber = accountInfo.sequence_number
        const transaction = await aptos.transaction.build.simple({
            sender: singer.accountAddress,
            data: {
                function: `${this.contractAddress}::market::execute_open_position_order`,
                typeArguments: [
                    VaultList.find(vault => vault.name === order.vault).tokenAddress,
                    SymbolList.find(symbol => symbol.tokenName === order.symbol).tokenAddress,
                    getSideAddress(order.direction),
                    APTOS_COIN,
                ],
                functionArguments: [
                    order.owner,
                    order.order_id,
                    []
                ],
            },
            options: {
                // accountSequenceNumber: Number(seqNumber)
            }
        });

        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: singer,
            transaction,
        });

        const response = await aptos.waitForTransaction({
            transactionHash: committedTransaction.hash
        })
        console.log("🚀 ~ ScannerService ~ executeOrderRecords ~ response:", response.success)

        await this.prisma.increaseOrderRecord.update({
            data: {
                executed: true,
                status: 'DONE'
            },
            where: {
                id: order.id,
                vault: order.vault,
                symbol: order.symbol,
                direction: order.direction,
            }
        })
    }

    async executeDecreaseOrderRecords(order: DecreaseOrderRecord) {
        console.log("🚀 ~ ScannerService ~ executeOrderRecords decrease ~ order:", order)
        const accountInfo = await aptos.account.getAccountInfo({ accountAddress: singer.accountAddress })
        const seqNumber = accountInfo.sequence_number
        const transaction = await aptos.transaction.build.simple({
            sender: singer.accountAddress,
            data: {
                function: `${this.contractAddress}::market::execute_decrease_position_order`,
                typeArguments: [
                    VaultList.find(vault => vault.name === order.vault).tokenAddress,
                    SymbolList.find(symbol => symbol.tokenName === order.symbol).tokenAddress,
                    getSideAddress(order.direction),
                    APTOS_COIN,
                ],
                functionArguments: [
                    order.owner,
                    order.order_id,
                    order.position_num,
                    []
                ],
            },
            options: {
                // accountSequenceNumber: Number(seqNumber)
            }
        });

        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: singer,
            transaction,
        });

        const response = await aptos.waitForTransaction({
            transactionHash: committedTransaction.hash
        })
        console.log("🚀 ~ ScannerService ~ executeOrderRecords ~ response:", response.success)

        await this.prisma.decreaseOrderRecord.update({
            data: {
                executed: true,
                status: 'DONE'
            },
            where: {
                id: order.id,
                vault: order.vault,
                symbol: order.symbol,
                direction: order.direction,
            }
        })
    }


    async syncOnChainOrderRecords() {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();

        try {
            await Promise.all(PAIRS.map(async pair => {
                const pairEntity = await this.prisma.positionOrderHandle.findFirst({
                    where: {
                        vault: pair.vault,
                        symbol: pair.symbol,
                        direction: pair.direction
                    }
                })
                if (pairEntity) {
                    await this.fetchOrderRecordTableIncrease(pairEntity, iHeight);
                    await this.fetchOrderRecordTableDecrease(pairEntity, dHeight);
                }
            }));
        } catch (error) {
            this.logger.error(error);
        }
    }

    async fetchOrderRecordTableIncrease(pair: PositionOrderHandle, iHeight: string) {
        const increase_handle = pair.increase_order_handle
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
            const verA = a.transaction_version
            const verB = b.transaction_version
            return verB - verA
        })
        if (sortedData.length > 0) {
            await this.prisma.updateGlobalSyncParams(sortedData[0].transaction_version.toString(), 'INCREASE_ORDER_RECORD')
        }
        this.prisma.saveIncreaseOrderRecord(sortedData)
    }

    async fetchOrderRecordTableDecrease(pair: PositionOrderHandle, dHeight: string) {
        const decrease_handle = pair.decrease_order_handle
        const dec_response = await aptos.getTableItemsData({
            minimumLedgerVersion: Number(dHeight),
            options: {
                where: {
                    table_handle: { _eq: decrease_handle },
                    transaction_version: { _gte: dHeight }

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
            const verA = a.transaction_version
            const verB = b.transaction_version
            return verB - verA
        })

        if (sortedData.length > 0) {
            await this.prisma.updateGlobalSyncParams(sortedData[0].transaction_version.toString(), 'DECREASE_ORDER_RECORD')
        }
        this.prisma.saveDecreaseOrderRecord(sortedData)
    }

    async syncOnChainPositionRecords() {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();

        try {
            await Promise.all(PAIRS.map(async pair => {
                const pairEntity = await this.prisma.positionOrderHandle.findFirst({
                    where: {
                        vault: pair.vault,
                        symbol: pair.symbol,
                        direction: pair.direction
                    }
                })
                await this.fetchPositionRecords(pairEntity, pHeight);
            }));
        } catch (error) {
            this.logger.error(error);
        }
    }

    async fetchPositionRecords(pair: PositionOrderHandle, pHeight: string) {
        const result = await aptos.getTableItemsData({
            minimumLedgerVersion: Number(pHeight),
            options: {
                where: {
                    table_handle: { _eq: pair.position_handle },
                    transaction_version: { _gt: pHeight }
                },
                orderBy: [{ transaction_version: 'desc' }],
            },
        });
        const updatedDecResponse = result.map(item => ({
            ...item,
            vault: pair.vault,
            symbol: pair.symbol,
            direction: pair.direction,
        }))
        const sortedData: any[] = updatedDecResponse.sort((a, b) => {
            const verA = a.transaction_version
            const verB = b.transaction_version
            return verB - verA
        })
        if (sortedData.length > 0) {
            await this.prisma.updateGlobalSyncParams(sortedData[0].transaction_version.toString(), 'POSITION_RECORD')
        }
        this.prisma.savePositionRecords(sortedData)

    }


    async manualSync() {
        await this.syncOnChainOrderRecords();
    }


    async checkLiquidation(prices: any[]) {
        const pricesList = prices.map((price, index) => {
            return { name: this.priceIds[index].name, price: convertDecimal(Number(price)) }
        })

        for (const symbol of WrappedTokenConfigList) {
            const symbolName = symbol.symbol_name
            const symbolPrice = pricesList.find((priceInfo) => priceInfo.name === symbolName).price
            const positions = await this.prisma.positionRecord.findMany({
                where: {
                    closed: false,
                    symbol: symbolName
                }
            });

            const explodingPositions = positions.filter(position => {
                const collateralPrice = pricesList.find((priceInfo) => priceInfo.name === position.vault).price;
                const collateralValue = BigInt(position.collateral) * BigInt(collateralPrice);
                let deltaSize = BigInt(0);

                if (position.direction === 'LONG') {
                    deltaSize = BigInt(symbolPrice) * BigInt(position.position_amount) - BigInt(position.position_size);
                } else {
                    deltaSize = BigInt(position.position_size) - BigInt(symbolPrice) * BigInt(position.position_amount);
                }

                const collMulRate = collateralValue * convertBackDecimal(Number(symbol.liquidation_threshold.value), 16) / BigInt(100);

                // Return true if the position is at risk of liquidation, otherwise false
                return collMulRate < deltaSize;
            });

            for (const position of explodingPositions) {
                await this.executeLiquidation(position);
            }
        }
    }

    async executeLiquidation(position: PositionRecord) {
        console.log("🚀 ~ executeLiquidation ~ position execute", `${position.owner} ${position.vault} ${position.symbol} ${position.direction}`)
        const transaction = await aptos.transaction.build.simple({
            sender: singer.accountAddress,
            data: {
                function: `${this.contractAddress}::market::liquidate_position`,
                typeArguments: [
                    VaultList.find(vault => vault.name === position.vault).tokenAddress,
                    SymbolList.find(symbol => symbol.tokenName === position.symbol).tokenAddress,
                    getSideAddress(position.direction),
                ],
                functionArguments: [
                    position.owner,
                    position.order_id,
                    []
                ],
            },
        });

        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: singer,
            transaction,
        });

        const response = await aptos.waitForTransaction({
            transactionHash: committedTransaction.hash
        })
        console.log("🚀 ~ ScannerService ~ executeOrderRecords ~ response:", response.success)
    }


    async aggregateFeeData() {
        const result = Promise.all(PAIRS.map((pair: any) => {
            this.orderOrPositionService.getAggregateData(pair.vault, pair.symbol, pair.direction)
        }))
    }

}