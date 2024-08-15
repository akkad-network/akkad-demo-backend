import * as dotenv from 'dotenv'
dotenv.config()
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
    private readonly logger = new Logger(ScannerService.name)
    private readonly priceFeedAddress: string = FEERDER_ADDRESS
    private readonly moduleAddress: string = MODULE_ADDRESS
    private readonly priceIds: any[] = [
        { name: "APTOS", address: AptFeeder },
        { name: "USDT", address: UsdtFeeder },
        { name: "USDC", address: UsdcFeeder },
        { name: "BTC", address: BtcFeeder },
        { name: "ETH", address: EthFeeder }
    ];
    private readonly SYNC_POSITIONS = process.env.SYNC_POSITIONS
    private readonly SYNC_ORDERS = process.env.SYNC_ORDERS

    private readonly UPDATE_PRICE_FEED = process.env.UPDATE_PRICE_FEED
    private readonly EXECUTE_ORDERS = process.env.EXECUTE_ORDERS
    private readonly EXECUTE_LIQUIDATION = process.env.EXECUTE_LIQUIDATION

    private readonly VAULT_APT = process.env.VAULT_APT
    private readonly VAULT_USDC = process.env.VAULT_USDC
    private readonly VAULT_USDT = process.env.VAULT_USDT

    private FUNC_PAIRS: any[] = []

    constructor(private readonly prisma: PrismaService, private readonly orderOrPositionService: OrderOrPositionService) {
        PAIRS.map((pair) => {
            if (this.isFunctionOn(this.VAULT_APT)) {
                if (pair.vault === 'APTOS') {
                    this.FUNC_PAIRS.push(pair)
                }
            }
            if (this.isFunctionOn(this.VAULT_USDC)) {
                if (pair.vault === 'USDC') {
                    this.FUNC_PAIRS.push(pair)
                }
            }
            if (this.isFunctionOn(this.VAULT_USDT)) {
                if (pair.vault === 'USDT') {
                    this.FUNC_PAIRS.push(pair)
                }
            }
        })
        console.log('start scanner : FUNC_PAIRS ', this.FUNC_PAIRS)

        console.log('check scanner config => SYNC_POSITIONS', this.SYNC_POSITIONS)
        console.log('check scanner config => SYNC_ORDERS', this.SYNC_ORDERS)

        console.log('check scanner config => UPDATE_PRICE_FEED', this.UPDATE_PRICE_FEED)
        console.log('check scanner config => EXECUTE_ORDERS', this.EXECUTE_ORDERS)
        console.log('check scanner config => EXECUTE_LIQUIDATION', this.EXECUTE_LIQUIDATION)

        console.log('check scanner config => VAULT_APT', this.VAULT_APT)
        console.log('check scanner config => VAULT_USDC', this.VAULT_USDC)
        console.log('check scanner config => VAULT_USDT', this.VAULT_USDT)
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handlePriceFeeder() {
        await this.fetchPrice();
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleSyncOrderRecords() {
        if (this.isFunctionOn(this.SYNC_ORDERS)) {
            await this.syncOnChainOrderRecords();
        }
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleSyncPositionData() {
        if (this.isFunctionOn(this.SYNC_POSITIONS)) {
            await this.syncOnChainPositionRecords();
        }
    }

    async fetchPrice(): Promise<void> {
        const vaas = await Promise.all(this.priceIds.map(pair => this.fetchVaa(pair.address)));
        const vasBytes = vaas.map(vaa => Array.from(Buffer.from(vaa.binary, 'hex')));
        const parsedPrices = vaas.map(vaa => vaa.parsed);

        if (this.isFunctionOn(this.UPDATE_PRICE_FEED)) {
            await this.updateFeedToAptos(vasBytes)
        }
        if (this.isFunctionOn(this.EXECUTE_ORDERS)) {
            await this.scanOrderRecords(parsedPrices)
        }
        if (this.isFunctionOn(this.EXECUTE_LIQUIDATION)) {
            await this.checkLiquidation(parsedPrices);
        }
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
        for (const pair of this.FUNC_PAIRS) {
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
                function: `${this.moduleAddress}::market::execute_open_position_order`,
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
                function: `${this.moduleAddress}::market::execute_decrease_position_order`,
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
            await Promise.all(this.FUNC_PAIRS.map(async pair => {
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
            await Promise.all(this.FUNC_PAIRS.map(async pair => {
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
                const vaultInfo = VaultList.find((vault) => vault.name === position.vault)
                const collateralValue = convertBackDecimal(position.collateral, vaultInfo.decimal) * convertBackDecimal(collateralPrice, 18);
                const collVauleMulRate = collateralValue * 98 / 100
                const deltaSize = Number(convertBackDecimal(symbolPrice, 18)) * Number(convertBackDecimal(position.position_amount, symbol.decimal)) - Number(convertBackDecimal(position.position_size, 18));
                if (position.direction === 'LONG') {
                    return collVauleMulRate + deltaSize < 0
                } else {
                    return collVauleMulRate - deltaSize < 0
                }

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
                function: `${this.moduleAddress}::market::liquidate_position`,
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

    isFunctionOn(flag: string): boolean {
        return flag === 'ON'
    }

}