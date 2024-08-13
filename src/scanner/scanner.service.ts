import { OrderOrPositionService } from './../order-or-position/order-or-position.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Aptos, APTOS_COIN } from '@aptos-labs/ts-sdk';
import axios from 'axios';
import { convertBackDecimal, convertDecimal, getSideAddress, getTableHandle, PAIRS, SymbolList, VaultList } from 'src/utils/helper';
import { AptFeeder, aptos, BtcFeeder, EthFeeder, executerSigner, FEERDER_ADDRESS, liquidatorSigner, MODULE_ADDRESS, priceFeederSyncerSigner, UsdcFeeder, UsdtFeeder } from 'src/main';
import { DecreaseOrderRecord, IncreaseOrderRecord, PositionOrderHandle, PositionRecord } from '@prisma/client';

@Injectable()
export class ScannerService {
    private readonly aptos: Aptos
    private readonly logger = new Logger(ScannerService.name)
    private readonly priceFeedAddress: string = FEERDER_ADDRESS
    private readonly contractAddress: string = MODULE_ADDRESS
    private readonly priceIds: any[] = [
        { name: "APTOS", address: AptFeeder },
        { name: "USDT", address: UsdtFeeder },
        { name: "USDC", address: UsdcFeeder },
        { name: "BTC", address: BtcFeeder },
        { name: "ETH", address: EthFeeder }
    ];

    constructor(private readonly prisma: PrismaService, private readonly orderOrPositionService: OrderOrPositionService) { }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handlePriceFeeder() {
        await this.updateFeed();
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleSyncOrderRecords() {
        await this.syncOnChainOrderRecords();
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleSyncPositionData() {
        await this.syncOnChainPositionRecords();
    }

    async updateFeed(): Promise<void> {
        const vaas = await Promise.all(this.priceIds.map(pair => this.fetchVaa(pair.address)));
        const vasBytes = vaas.map(vaa => Array.from(Buffer.from(vaa.binary, 'hex')));
        const parsedPrices = vaas.map(vaa => vaa.parsed);
        await this.updateFeedToAptos(vasBytes)
        await this.scanOrderRecords(parsedPrices)
        await this.checkLiquidation(parsedPrices);
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
            sender: priceFeederSyncerSigner.accountAddress,
            data: {
                function: `${this.priceFeedAddress}::pyth::update_price_feeds_with_funder`,
                typeArguments: [],
                functionArguments: [vasBytes],
            },
        });

        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: priceFeederSyncerSigner,
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
        const accountInfo = await aptos.account.getAccountInfo({ accountAddress: executerSigner.accountAddress })
        const seqNumber = accountInfo.sequence_number
        const transaction = await aptos.transaction.build.simple({
            sender: executerSigner.accountAddress,
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
            signer: executerSigner,
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
        const accountInfo = await aptos.account.getAccountInfo({ accountAddress: executerSigner.accountAddress })
        const seqNumber = accountInfo.sequence_number
        const transaction = await aptos.transaction.build.simple({
            sender: executerSigner.accountAddress,
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
            signer: executerSigner,
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

        for (const symbol of SymbolList) {
            const symbolName = symbol.tokenName
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

                const collMulRate = collateralValue * BigInt(98) / BigInt(100);

                // Return true if the position is at risk of liquidation, otherwise false
                return collMulRate < deltaSize;
            });

            for (const position of explodingPositions) {
                await this.executeLiquidation(position);
            }
        }
    }

    async executeLiquidation(position: PositionRecord) {
        console.log("🚀 ~ executeLiquidation ~ position execute", `${position.id} ${position.order_id} ${position.owner} ${position.vault} ${position.symbol} ${position.direction}`)
        const accountInfo = await aptos.account.getAccountInfo({ accountAddress: liquidatorSigner.accountAddress })
        const seqNumber = accountInfo.sequence_number
        const transaction = await aptos.transaction.build.simple({
            sender: liquidatorSigner.accountAddress,
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
            options: {
                // accountSequenceNumber: Number(seqNumber)
            }
        });
        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: liquidatorSigner,
            transaction,
        });

        const response = await aptos.waitForTransaction({
            transactionHash: committedTransaction.hash
        })
        console.log("🚀 ~ ScannerService ~ executeOrderRecords ~ response:", response.success)
    }
}