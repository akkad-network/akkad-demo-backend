import { getSideAddress, SymbolList, VaultInfo, formatAptosDecimal, SymbolInfo, formatAptosDecimalForParams } from './../utils/helper';
import * as dotenv from 'dotenv'
dotenv.config()
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PricefeederService } from 'src/pricefeeder/pricefeeder.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { aptos, MODULE_ADDRESS, priceFeederSyncerSigner } from 'src/main';
import { APTOS_COIN } from '@aptos-labs/ts-sdk';
import { PAIRS, VaultList, convertBackDecimal } from 'src/utils/helper';
import { SynchronizerService } from 'src/synchronizer/synchronizer.service';

@Injectable()
export class BatchtestService {
    private readonly logger = new Logger(BatchtestService.name)

    private readonly BATCH_TEST = process.env.BATCH_TEST
    private isBatchOpenPositionMarkInProcess = false
    private readonly moduleAddress: string = MODULE_ADDRESS

    constructor(private readonly prisma: PrismaService,
        private readonly priceFeederService: PricefeederService,
        private readonly synchronizerService: SynchronizerService
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async batchOpenPositionMark() {
        if (this.isFunctionOn(this.BATCH_TEST)) {
            if (this.isBatchOpenPositionMarkInProcess) return
            this.isBatchOpenPositionMarkInProcess = true
            // await this.batchMark()
            this.isBatchOpenPositionMarkInProcess = false
            this.logger.debug("🚀 ~ batch OpenPosition | Mark | ~ ")
        }
    }

    async batchMark() {
        const vasBytes = this.priceFeederService.getVasBytes()
        const prices = this.priceFeederService.getParsedPrices()
        if (!vasBytes || vasBytes.length === 0) return
        if (!prices || prices.length === 0) return

        for (const pair of PAIRS) {
            const vaultInfo = VaultList.find((item) => item.symbol === pair.vault)
            const symbolInfo = SymbolList.find((item) => item.tokenSymbol === pair.symbol)
            await this.openPositionMarkPrice(prices, vasBytes, vaultInfo, symbolInfo, pair.direction)
        }
    }

    async openPositionMarkPrice(prices: any[], vasBytes: any[], vaultInfo: VaultInfo, symbolInfo: SymbolInfo, side: string) {
        let open_amount = 0
        let collateral = 0
        let reserve_amount = 0
        const vaultPriceInfo = prices.find((item) => item.symbol === vaultInfo.symbol)
        const vaultPrice = convertBackDecimal(vaultPriceInfo.parsed, vaultPriceInfo.priceDecimal)
        const symbolPriceInfo = prices.find((item) => item.symbol === symbolInfo.tokenSymbol)
        const symbolPrice = convertBackDecimal(symbolPriceInfo.parsed, symbolPriceInfo.priceDecimal)
        const slippage = 0.01
        if (vaultInfo.symbol === 'APT') return
        switch (vaultInfo.symbol) {
            case 'APT': // no enough test token
                break
            case 'USDT':
                collateral = 10
                reserve_amount = 10 * 20 //20x reserve
                open_amount = collateral * 90 * vaultPrice / symbolPrice
                break
            case 'USDC':
                collateral = 10
                reserve_amount = 10 * 20
                open_amount = collateral * 90 * vaultPrice / symbolPrice
                break
            case 'BTC':
                collateral = 0.0001
                reserve_amount = 0.0001 * 20
                open_amount = collateral * 90 * vaultPrice / symbolPrice
                break
            case 'ETH':
                collateral = 0.003
                reserve_amount = 0.01 * 20
                open_amount = collateral * 90 * vaultPrice / symbolPrice
                break
        }
        const transaction = await aptos.transaction.build.simple({
            sender: priceFeederSyncerSigner.accountAddress,
            data: {
                function: `${this.moduleAddress}::market::open_position`,
                typeArguments: [
                    vaultInfo.tokenAddress,
                    symbolInfo.tokenAddress,
                    getSideAddress(side),
                    APTOS_COIN,
                ],
                functionArguments: [
                    1, //trade level
                    formatAptosDecimalForParams(open_amount, symbolInfo.decimal),// open_amount
                    formatAptosDecimalForParams(reserve_amount, vaultInfo.decimal),  // reserve_amount
                    formatAptosDecimalForParams(collateral, vaultInfo.decimal),  // collateral
                    10,          // fee_amount
                    formatAptosDecimalForParams(
                        vaultPrice * (1 - slippage),
                        18
                    ),      // collateral_price_threshold
                    side === 'LONG'
                        ? formatAptosDecimalForParams(
                            Number(symbolPrice * (1 - slippage)),
                            18
                        )
                        : formatAptosDecimalForParams(
                            Number(symbolPrice * (1 + slippage)),
                            18
                        ),  // limited_index_price
                    vasBytes
                ],
            },
        })
        try {
            const committedTx = await aptos.signAndSubmitTransaction({
                signer: priceFeederSyncerSigner,
                transaction: transaction,
            })

            const response = await aptos.waitForTransaction({
                transactionHash: committedTx.hash
            })
            this.logger.verbose("🚀 ~ Batch Open Position ~", response.success.toString())
            this.synchronizerService.mannualSyncOrderBook(vaultInfo.symbol, symbolInfo.tokenSymbol, side)
            this.synchronizerService.mannualSyncPositionRecords(vaultInfo.symbol, symbolInfo.tokenSymbol, side)

        } catch (error) {
            this.logger.error("🚀 ~ Batch Open Position ~", error.toString())
        }

    }

    private isFunctionOn(flag: string): boolean {
        return flag === 'ON'
    }
}
