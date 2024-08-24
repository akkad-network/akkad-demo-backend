import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { COIN_ADDRESS, convertBackDecimal, convertDecimal, DIRECTION, getSideAddress, getTableHandle, MOCK_USDT_COIN_STORE, PAIRS, parseAptosDecimal, SymbolList, VaultList } from 'src/utils/helper';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AptFeeder, aptos, AvaxFeeder, BnbFeeder, BtcFeeder, DogeFeeder, EthFeeder, executerSigner, FEERDER_ADDRESS, liquidatorSigner, MODULE_ADDRESS, PepeFeeder, priceFeederSyncerSigner, SolFeeder, UsdcFeeder, UsdtFeeder } from 'src/main';
import { PositionOrderHandle } from '@prisma/client';

@Injectable()
export class SynchronizerService {
    private readonly logger = new Logger(SynchronizerService.name)

    private readonly VAULT_APT = process.env.VAULT_APT
    private readonly VAULT_USDC = process.env.VAULT_USDC
    private readonly VAULT_USDT = process.env.VAULT_USDT
    private readonly VAULT_BTC = process.env.VAULT_BTC
    private readonly VAULT_ETH = process.env.VAULT_ETH
    private FUNC_PAIRS: any[] = []

    private readonly SYNC_POSITIONS = process.env.SYNC_POSITIONS
    private readonly SYNC_ORDERS = process.env.SYNC_ORDERS
    private readonly SYNC_SYMBOL_CONFIG = process.env.SYNC_SYMBOL_CONFIG
    private readonly SYNC_VAULT_CONFIG = process.env.SYNC_VAULT_CONFIG
    private readonly SYNC_LP_TOKEN_PRICE = process.env.SYNC_LP_TOKEN_PRICE

    private isSyncOrderBookInProcess = false
    private isSyncPositionInProcess = false

    constructor(
        private readonly prisma: PrismaService,) {
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

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleSyncSymbolConfig() {
        if (this.isFunctionOn(this.SYNC_SYMBOL_CONFIG)) {
            await this.syncOnChainSymbolConfig();
            this.logger.debug("🚀 ~ Symbol Config Sync ~ ")
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleSyncVaultConfig() {
        if (this.isFunctionOn(this.SYNC_VAULT_CONFIG)) {
            await this.syncOnChainVaultConfig();
            this.logger.debug("🚀 ~ Vault Config Sync ~ ")
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async syncLpTokenPrice() {
        if (this.isFunctionOn(this.SYNC_LP_TOKEN_PRICE)) {
            await this.syncOnChainLpTokenPrice();
            this.logger.debug("🚀 ~ Lp Token Price Sync ~ ")
        }
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleSyncOrderRecords() {
        if (this.isFunctionOn(this.SYNC_ORDERS)) {
            if (this.isSyncOrderBookInProcess) return
            this.isSyncOrderBookInProcess = true
            await this.syncOnChainOrderBook();
            this.isSyncOrderBookInProcess = false
            this.logger.debug("🚀 ~ Order Book Sync ~ ")
        }
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleSyncPositionData() {
        if (this.isFunctionOn(this.SYNC_POSITIONS)) {
            if (this.isSyncPositionInProcess) return
            this.isSyncPositionInProcess = true
            await this.syncOnChainPositionRecords();
            this.isSyncPositionInProcess = false
            this.logger.debug("🚀 ~ Positions Sync ~ ")
        }
    }

    async syncOnChainOrderBook() {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();
        try {
            for (const pair of this.FUNC_PAIRS) {
                const pairEntity = await this.prisma.positionOrderHandle.findFirst({
                    where: {
                        vault: pair.vault,
                        symbol: pair.symbol,
                        direction: pair.direction
                    }
                })
                if (pairEntity) {
                    await this.fetchIncreaseOrders(pairEntity, iHeight);
                    await this.fetchDecreaseOrders(pairEntity, dHeight);
                }
            }
        } catch (error) {
            this.logger.error(`Error Fetching Orders handle failed`);
        }
    }

    async fetchIncreaseOrders(pair: PositionOrderHandle, iHeight: string) {
        const increase_handle = pair.increase_order_handle
        try {
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

            if (!inc_response || inc_response.length === 0) {
                return
            }

            const updatedIncResponse = inc_response.map(item => ({
                ...item,
                order_type: 'increase',
                vault: pair.vault,
                symbol: pair.symbol,
                direction: pair.direction,
            }))

            const nullList = updatedIncResponse.filter((item) => item.decoded_value === null)

            if (nullList && nullList.length > 0) {
                this.prisma.updateIncCancelOrderRecords(nullList)
            }

            const notNullList = updatedIncResponse.filter((item) => item.decoded_value !== null)

            if (notNullList && notNullList.length > 0) {
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
        } catch (error) {
            this.logger.error('Fetch Increase Order Failed', error)
        }

    }

    async fetchDecreaseOrders(pair: PositionOrderHandle, dHeight: string) {
        const decrease_handle = pair.decrease_order_handle
        try {
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
            if (!dec_response || dec_response.length === 0) {
                return
            }
            const updatedDecResponse = dec_response.map(item => ({
                ...item,
                order_type: 'decrease',
                vault: pair.vault,
                symbol: pair.symbol,
                direction: pair.direction,
            }));

            const nullList = updatedDecResponse.filter((item) => item.decoded_value === null)

            if (nullList && nullList.length > 0) {
                this.prisma.updateDecCancelOrderRecords(nullList)
            }

            const notNullList = updatedDecResponse.filter((item) => item.decoded_value !== null)

            if (notNullList && notNullList.length > 0) {
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
        } catch (error) {
            this.logger.error('Fetch Decrease Order Failed', error)
        }
    }

    async syncOnChainPositionRecords() {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();

        try {
            for (const pair of this.FUNC_PAIRS) {
                const pairEntity = await this.prisma.positionOrderHandle.findFirst({
                    where: {
                        vault: pair.vault,
                        symbol: pair.symbol,
                        direction: pair.direction
                    }
                })
                await this.fetchPositions(pairEntity, pHeight);
            }

        } catch (error) {
            this.logger.error(`Error fetching Position Records`);
        }
    }

    async fetchPositions(pair: PositionOrderHandle, pHeight: string) {
        const result = await aptos.getTableItemsData({
            options: {
                where: {
                    table_handle: { _eq: pair.position_handle },
                    transaction_version: { _gt: pHeight }
                },
                orderBy: [{ transaction_version: 'desc' }],
            },
        });
        if (!result || result.length === 0) {
            return
        }
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


    async syncOnChainSymbolConfig() {
        for (const direction of DIRECTION) {
            for (const symbol of SymbolList) {
                const result = await aptos.getAccountResource({
                    accountAddress: MODULE_ADDRESS,
                    resourceType: `${MODULE_ADDRESS}::pool::Symbol<${symbol.tokenAddress},${direction.address}>`
                })
                if (result) {
                    await this.prisma.symbolDirectionConfig.create({
                        data: {
                            symbol: symbol.tokenSymbol,
                            direction: direction.name,
                            acc_funding_rate_flag: result.acc_funding_rate.is_positive,
                            acc_funding_rate_value: result.acc_funding_rate.value.value,
                            opening_amount: result.opening_amount,
                            opening_size: result.opening_size.value,
                            realised_pnl_flag: result.realised_pnl.is_positive,
                            realised_pnl_value: result.realised_pnl.value.value,
                            unrealised_funding_fee_flag: result.unrealised_funding_fee_value.is_positive,
                            unrealised_funding_fee_value: result.unrealised_funding_fee_value.value.value,
                            last_update: result.last_update
                        }
                    })
                }
            }

        }
    }


    async syncOnChainVaultConfig() {
        for (const vault of VaultList) {
            const result = await aptos.getAccountResource({
                accountAddress: MODULE_ADDRESS,
                resourceType: `${MODULE_ADDRESS}::pool::Vault<${vault.tokenAddress}>`
            })
            if (result) {
                await this.prisma.vaultConfig.create({
                    data: {
                        vault: vault.symbol,
                        acc_reserving_rate: result.acc_reserving_rate.value,
                        last_update: result.last_update,
                        liquidity: result.liquidity.value,
                        reserved_amount: result.reserved_amount,
                        unrealised_reserving_fee_amount: result.unrealised_reserving_fee_amount.value
                    }
                })
            }
        }
    }


    async syncOnChainLpTokenPrice() {
        try {
            const result = await aptos.view({
                payload: {
                    function: `${MODULE_ADDRESS}::market::to_lp_amount`,
                    typeArguments: [`${COIN_ADDRESS}::usdt::USDT`],
                    functionArguments: [1000000000],
                },
            })
            const price = Number(result?.[0]).toString()
            const price_formatted = (1 / parseAptosDecimal((Number(result?.[0]) / 1000) || 0, 6)).toFixed(8)
            await this.prisma.lPTokenPriceRecords.create({
                data: {
                    price, price_formatted
                }
            })
        } catch (error) {
            this.logger.error(`Error fetching LP Token`);
        } finally { }
    }

    private isFunctionOn(flag: string): boolean {
        return flag === 'ON'
    }

}
