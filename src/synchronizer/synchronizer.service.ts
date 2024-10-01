import { formatAptosDecimalForParams, SymbolInfo } from './../utils/helper';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { COIN_ADDRESS, convertBackDecimal, DIRECTION, PAIRS, parseAptosDecimal, SymbolList, VaultList } from 'src/utils/helper';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AptFeeder, aptos, AvaxFeeder, BnbFeeder, BtcFeeder, DogeFeeder, EthFeeder, executerSigner, FEERDER_ADDRESS, liquidatorSigner, MODULE_ADDRESS } from 'src/main';
import { PositionOrderHandle } from '@prisma/client';
import { PricefeederService } from 'src/pricefeeder/pricefeeder.service';

@Injectable()
export class SynchronizerService {
    private readonly logger = new Logger(SynchronizerService.name)

    private readonly VAULT_APT = process.env.VAULT_APT
    private readonly VAULT_USDC = process.env.VAULT_USDC
    private readonly VAULT_USDT = process.env.VAULT_USDT
    private readonly VAULT_BTC = process.env.VAULT_BTC
    private readonly VAULT_ETH = process.env.VAULT_ETH
    private readonly VAULT_STAPT = process.env.VAULT_STAPT

    private FUNC_PAIRS: any[] = []

    private readonly SYNC_POSITIONS = process.env.SYNC_POSITIONS
    private readonly SYNC_ORDERS = process.env.SYNC_ORDERS
    private readonly SYNC_SYMBOL_CONFIG = process.env.SYNC_SYMBOL_CONFIG
    private readonly SYNC_VAULT_CONFIG = process.env.SYNC_VAULT_CONFIG
    private readonly SYNC_LP_TOKEN_PRICE = process.env.SYNC_LP_TOKEN_PRICE
    private readonly SYNC_REFERRER = process.env.SYNC_REFERRER
    private readonly SYNC_SIMULATE_LP = process.env.SYNC_SIMULATE_LP

    private isSyncOrderBookInProcess = false
    private isSyncPositionInProcess = false
    private isSyncReferrerInProcess = false
    private isSyncSimulateLpInProcess = false

    constructor(
        private readonly prisma: PrismaService,
        private readonly priceFeederService: PricefeederService,
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
            if (this.isFunctionOn(this.VAULT_STAPT)) {
                if (pair.vault === 'stAPT') {
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
            // await this.syncOnChainLpTokenPrice();
            this.logger.debug("🚀 ~ Lp Token Price Sync ~ ")
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleSyncOrderRecords() {
        if (this.isFunctionOn(this.SYNC_ORDERS)) {
            if (this.isSyncOrderBookInProcess) return
            this.isSyncOrderBookInProcess = true
            this.logger.debug("🚀 ~ Order Book Sync ~ ")
            await this.syncOnChainOrderBook();
            this.isSyncOrderBookInProcess = false
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleSyncPositionData() {
        if (this.isFunctionOn(this.SYNC_POSITIONS)) {
            if (this.isSyncPositionInProcess) return
            this.isSyncPositionInProcess = true
            this.logger.debug("🚀 ~ Positions Sync ~ ")
            await this.syncOnChainPositionRecords();
            this.isSyncPositionInProcess = false
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleSyncReferrerinfo() {
        if (this.isFunctionOn(this.SYNC_REFERRER)) {
            if (this.isSyncReferrerInProcess) return
            this.isSyncReferrerInProcess = true
            this.logger.debug("🚀 ~ Sync Referrer ~ ")
            await this.syncOnChainReferrerInfo()
            this.isSyncReferrerInProcess = false
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleSyncLpPriceWithAptos() {
        if (this.isFunctionOn(this.SYNC_SIMULATE_LP)) {
            if (this.isSyncSimulateLpInProcess) return
            this.isSyncSimulateLpInProcess = true
            this.logger.debug("🚀 ~ Sync Simulate Lp price ~ ")
            await this.simulateLpInPrice('APT')
            this.isSyncSimulateLpInProcess = false
        }
    }

    async simulateLpInPrice(vault: string, amountIn?: number) {
        if (!amountIn) amountIn = 1
        const prices = this.priceFeederService.getParsedPrices()
        if (!prices || prices.length === 0) return
        const vasBytes = this.priceFeederService.getVasBytes()
        if (!vasBytes || vasBytes.length === 0) return
        const priceInfo = prices.find((price) => price.name === vault)
        if (!priceInfo) return
        const vaultPrice = convertBackDecimal(Number(priceInfo.parsed), priceInfo.priceDecimal)
        const vaultInfo = VaultList.find((item) => item.symbol === vault)

        const transaction = await aptos.transaction.build.simple({
            sender: executerSigner?.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::market::deposit`,
                typeArguments: [vaultInfo.tokenAddress],
                functionArguments: [
                    formatAptosDecimalForParams(amountIn, vaultInfo.decimal),
                    "10",
                    vasBytes,
                ],
            },
        })
        try {
            const [userTransactionResponse] = await aptos.transaction.simulate.simple({
                signerPublicKey: executerSigner?.publicKey,
                transaction,
            });
            const events = userTransactionResponse.events as any[]
            if (!events || events.length === 0) return
            const event = events.find((event) => {
                return event.type.indexOf(`${MODULE_ADDRESS}::market::Deposited`) !== -1
            })
            if (event) {
                const mintAmount = event?.data?.mint_amount
                const mintAmountParsed = parseAptosDecimal(Number(mintAmount), 6)
                if (mintAmountParsed === 0) return

                const lpPrice = Number(vaultPrice) * amountIn / parseAptosDecimal(Number(mintAmount), 6)
                await this.prisma.lPSimulatePriceRecords.create({
                    data: {
                        lpInName: vaultInfo.symbol,
                        lpInAmount: formatAptosDecimalForParams(amountIn, vaultInfo.decimal),
                        lpInPrice: vaultPrice.toString(),
                        lpOutName: 'AGLP',
                        lpOutAmount: mintAmountParsed.toString(),
                        lpOutPrice: lpPrice.toString()
                    }
                })
                return { deposit_amonut: event?.data?.deposit_amount, fee_value: event?.data?.fee_value?.value, mint_amount: event?.data?.mint_amount }
            }
        } catch (error) {
            this.logger.error(error.toString())
        } finally {

        }
    }

    async simulateLpOutPrice(vault: string, lpIn?: number) {
        if (!lpIn) lpIn = 100
        const prices = this.priceFeederService.getParsedPrices()
        if (!prices || prices.length === 0) return
        const vasBytes = this.priceFeederService.getVasBytes()
        if (!vasBytes || vasBytes.length === 0) return
        const priceInfo = prices.find((price) => price.name === vault)
        if (!priceInfo) return
        const vaultPrice = convertBackDecimal(Number(priceInfo.parsed), priceInfo.priceDecimal)
        const vaultInfo = VaultList.find((item) => item.symbol === vault)

        const transaction = await aptos.transaction.build.simple({
            sender: executerSigner?.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::market::withdraw`,
                typeArguments: [vaultInfo.tokenAddress],
                functionArguments: [
                    formatAptosDecimalForParams(lpIn, 6),
                    "1",
                    vasBytes,
                ],
            },
        })
        try {
            const [userTransactionResponse] = await aptos.transaction.simulate.simple({
                signerPublicKey: executerSigner?.publicKey,
                transaction,
            });
            const events = userTransactionResponse.events as any[]
            if (!events || events.length === 0) return
            const event = events.find((event) => {
                return event.type.indexOf(`${MODULE_ADDRESS}::market::Withdrawn`) !== -1
            })
            if (event) {
                return { burn_amount: event?.data?.burn_amount, fee_value: event?.data?.fee_value?.value, withdraw_amount: event?.data?.withdraw_amount }
            }
        } catch (error) {
            this.logger.error(error.toString())
        } finally {

        }
    }

    async syncOnChainReferrerInfo() {
        const { pHeight, iHeight, dHeight, rHeight } = await this.prisma.findRecordsHeight();

        for (const pair of this.FUNC_PAIRS) {
            const vaultAddress = VaultList.find((vault) => vault.symbol === pair.vault).tokenAddress
            const symbolAddress = SymbolList.find((symbol) => symbol.tokenSymbol === pair.symbol).tokenAddress
            try {
                const events: any = await aptos.getModuleEventsByEventType({
                    // options: { where: { type: { _eq: `${MODULE_ADDRESS}::market::ReferrerProfitExecute<${vaultAddress}, ${symbolAddress}>` } } }
                    eventType: `${MODULE_ADDRESS}::market::ReferrerProfitExecute<${vaultAddress}, ${symbolAddress}>`
                })
                if (!events || events.length === 0) continue
                for (const event of events) {
                    const data = event?.data
                    const transaction_version = event.transaction_version.toString()
                    if (!data) continue
                    const record = await this.prisma.referrerInfoRecords.findFirst({
                        where: {
                            transaction_version: transaction_version
                        }
                    })
                    if (record) continue
                    const tempResult = await this.prisma.referrerInfoRecords.create({
                        data: {
                            vault: pair.vault,
                            symbol: pair.symbol,
                            userAccount: data.user,
                            amount: data.amount,
                            referrer: data.referrer,
                            rebate_user_amount: data.rebate_user_amount,
                            rebate_referrer_amount: data.rebate_referrer_amount,
                            transaction_version: transaction_version
                        }
                    })
                    if (tempResult) {
                        await this.prisma.updateGlobalSyncParams(transaction_version, 'REFERRER_RECORD')
                    }
                }
            } catch (error) {
                this.logger.error(error.toString())
            } finally {
                continue
            }
        }
    }

    async mannualSyncOrderAndPositionOfOwner(vault: string, symbol: string, direction: string, owner: string) {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();
        try {
            const pairEntity = await this.prisma.positionOrderHandle.findFirst({
                where: {
                    vault,
                    symbol,
                    direction
                }
            })
            if (pairEntity) {
                await this.fetchPositions(pairEntity, pHeight, true, owner);
                await this.fetchIncreaseOrders(pairEntity, iHeight, true, owner);
                await this.fetchDecreaseOrders(pairEntity, dHeight, true, owner);
            }
        } catch (error) {
            this.logger.error(`Error everthing Error`);
        }
    }


    async mannualSyncOrderBook(vault: string, symbol: string, direction: string) {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();
        try {
            const pairEntity = await this.prisma.positionOrderHandle.findFirst({
                where: {
                    vault,
                    symbol,
                    direction
                }
            })
            if (pairEntity) {
                await this.fetchIncreaseOrders(pairEntity, iHeight, true);
                await this.fetchDecreaseOrders(pairEntity, dHeight, true);
            }
        } catch (error) {
            this.logger.error(`Error Fetching Orders handle failed`);
        } finally {
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
        } finally {
        }
    }

    async fetchIncreaseOrders(pair: PositionOrderHandle, iHeight: string, mannual: boolean = false, owner: string = "") {
        const increase_handle = pair.increase_order_handle
        let whereParams = {}
        if (owner && mannual) {
            whereParams = {
                table_handle: { _eq: increase_handle },
                decoded_key: { _contains: { owner } },
            }
        } else {
            whereParams = {
                table_handle: { _eq: increase_handle },
                transaction_version: { _gt: iHeight },
            }
        }
        try {
            const inc_response = await aptos.getTableItemsData({
                options: {
                    where: whereParams,
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
                await this.prisma.updateIncCancelOrderRecords(nullList)
            }

            const notNullList = updatedIncResponse.filter((item) => item.decoded_value !== null)

            if (notNullList && notNullList.length > 0) {
                const sortedData: any[] = notNullList.sort((a, b) => {
                    const verA = a.transaction_version
                    const verB = b.transaction_version
                    return verB - verA
                })
                if (sortedData.length > 0 && !mannual) {
                    await this.prisma.updateGlobalSyncParams(sortedData[0].transaction_version.toString(), 'INCREASE_ORDER_RECORD')
                }
                await this.prisma.saveIncreaseOrderRecord(sortedData)
            }
        } catch (error) {
            this.logger.error('Fetch Increase Order Failed', error)
        }
    }

    async fetchDecreaseOrders(pair: PositionOrderHandle, dHeight: string, mannual: boolean = false, owner: string = "") {
        const decrease_handle = pair.decrease_order_handle
        let whereParams = {}
        if (owner && mannual) {
            whereParams = {
                table_handle: { _eq: decrease_handle },
                decoded_key: { _contains: { owner } },
            }
        } else {
            whereParams = {
                table_handle: { _eq: decrease_handle },
                transaction_version: { _gt: dHeight },
            }
        }
        try {
            const dec_response = await aptos.getTableItemsData({
                options: {
                    where: whereParams,
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

                if (sortedData.length > 0 && !mannual) {
                    await this.prisma.updateGlobalSyncParams(sortedData[0].transaction_version.toString(), 'DECREASE_ORDER_RECORD')
                }
                await this.prisma.saveDecreaseOrderRecord(sortedData)
            }
        } catch (error) {
            this.logger.error('Fetch Decrease Order Failed', error)
        }
    }


    async mannualSyncPositionRecords(vault: string, symbol: string, direction: string) {
        const { pHeight, iHeight, dHeight } = await this.prisma.findRecordsHeight();

        try {
            const pairEntity = await this.prisma.positionOrderHandle.findFirst({
                where: {
                    vault,
                    symbol,
                    direction
                }
            })
            await this.fetchPositions(pairEntity, pHeight);
        } catch (error) {
            this.logger.error(`Error fetching Position Records`);
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

    async fetchPositions(pair: PositionOrderHandle, pHeight: string, mannual: boolean = false, owner: string = "") {
        let whereParams = {}
        if (owner && mannual) {

            whereParams = {
                table_handle: { _eq: pair.position_handle },
                decoded_key: { _contains: { owner } },
            }
        } else {
            whereParams = {
                table_handle: { _eq: pair.position_handle },
                transaction_version: { _gt: pHeight },
            }
        }
        const result = await aptos.getTableItemsData({
            options: {
                where: whereParams,
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
        if (sortedData.length > 0 && !mannual) {
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

    async fetchReferrerVolAndRebate(accountAddress: string) {
        return await this.prisma.referrerInfoRecords.findMany({
            where: {
                referrer: accountAddress
            }
        })
    }
    async fetchLpSimulatePrice() {
        return await this.prisma.lPSimulatePriceRecords.findFirst({
            orderBy: { createAt: 'desc' }
        })
    }

    private isFunctionOn(flag: string): boolean {
        return flag === 'ON'
    }






}
