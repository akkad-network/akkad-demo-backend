import * as dotenv from 'dotenv'
dotenv.config()
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { convertBackDecimal, convertDecimal, PAIRS, SymbolList, VaultList } from 'src/utils/helper';
import { AptFeeder, AvaxFeeder, BnbFeeder, BtcFeeder, DogeFeeder, EthFeeder, PepeFeeder, SolFeeder, UsdcFeeder, UsdtFeeder } from 'src/main';
import { PricefeederService } from 'src/pricefeeder/pricefeeder.service';
import { ExecutorService } from 'src/executor/executor.service';
import { LiquidatorService } from 'src/liquidator/liquidator.service';

@Injectable()
export class ScannerService {
    private readonly logger = new Logger(ScannerService.name)
    private readonly priceIds: any[] = [
        { name: "APT", address: AptFeeder },
        { name: "USDT", address: UsdtFeeder },
        { name: "USDC", address: UsdcFeeder },
        { name: "BTC", address: BtcFeeder },
        { name: "ETH", address: EthFeeder },
        { name: "BNB", address: BnbFeeder },
        { name: "SOL", address: SolFeeder },
        { name: "AVAX", address: AvaxFeeder },
        { name: "PEPE", address: PepeFeeder },
        { name: "DOGE", address: DogeFeeder },
    ];
    private readonly EXECUTE_ORDERS = process.env.EXECUTE_ORDERS
    private readonly EXECUTE_LIQUIDATION = process.env.EXECUTE_LIQUIDATION

    private readonly VAULT_APT = process.env.VAULT_APT
    private readonly VAULT_USDC = process.env.VAULT_USDC
    private readonly VAULT_USDT = process.env.VAULT_USDT
    private readonly VAULT_BTC = process.env.VAULT_BTC
    private readonly VAULT_ETH = process.env.VAULT_ETH

    private FUNC_PAIRS: any[] = []

    private isExecutorInProcess = false
    private isLiquidatorInProcess = false

    constructor(
        private readonly prisma: PrismaService,
        private readonly priceFeederService: PricefeederService,
        private readonly executorService: ExecutorService,
        private readonly liquidatorService: LiquidatorService

    ) {
        PAIRS.map((pair) => {
            if (this.isFunctionOn(this.VAULT_APT)) {
                if (pair.vault === 'APT') {
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
            if (this.isFunctionOn(this.VAULT_BTC)) {
                if (pair.vault === 'BTC') {
                    this.FUNC_PAIRS.push(pair)
                }
            }
            if (this.isFunctionOn(this.VAULT_ETH)) {
                if (pair.vault === 'ETH') {
                    this.FUNC_PAIRS.push(pair)
                }
            }
        })
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async scanOrderBookForExecution() {
        if (this.isFunctionOn(this.EXECUTE_ORDERS)) {
            if (this.isExecutorInProcess) return
            this.isExecutorInProcess = true
            await this.scanOrderBook()
            this.isExecutorInProcess = false
            this.logger.debug("🚀 ~ Scan OrderBook & Execute Orders ~ ")
        }
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async scanPositionsForLiquidation() {
        if (this.isFunctionOn(this.EXECUTE_LIQUIDATION)) {
            if (this.isLiquidatorInProcess) return
            this.isLiquidatorInProcess = true
            await this.scanPositions();
            this.isLiquidatorInProcess = false
            this.logger.debug("🚀 ~ Scan Positions & Execute Liquidation ~ ")
        }
    }

    async scanOrderBook() {
        const prices = this.priceFeederService.getParsedPrices()
        if (!prices || prices.length === 0) return
        const pricesList = prices.map((price, index) => {
            return { name: this.priceIds[index].name, price: convertDecimal(Number(price.parsed)) }
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
                await this.executorService.executeIncreaseOrder(order)
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
                await this.executorService.executeDecreaseOrder(order)
            }
        }
    }

    async scanPositions() {
        const prices = this.priceFeederService.getParsedPrices()
        if (!prices || prices.length === 0) return
        const pricesList = prices.map((price, index) => {
            return { name: this.priceIds[index].name, price: convertDecimal(Number(price.parsed)) }

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
                await this.liquidatorService.executeLiquidation(position);
            }
        }
    }

    private isFunctionOn(flag: string): boolean {
        return flag === 'ON'
    }

}