import {
    Account,
    Aptos,
    APTOS_COIN,
    AptosConfig,
    Ed25519PrivateKey,
    Network,
} from '@aptos-labs/ts-sdk'
import { APT_FEEDER_ADDRESS, AVAX_FEEDER_ADDRESS, BNB_FEEDER_ADDRESS, BTC_FEEDER_ADDRESS, DOGE_FEEDER_ADDRESS, ETH_FEEDER_ADDRESS, formatAptosDecimal, PEPE_FEEDER_ADDRESS, SOL_FEEDER_ADDRESS, USDC_FEEDER_ADDRESS, USDT_FEEDER_ADDRESS } from './helper'
import * as dotenv from 'dotenv'
import { COIN_ADDRESS, MODULE_ADDRESS } from 'src/main'
dotenv.config()


const aptosConfig = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(aptosConfig)
const moduleAddress =
    MODULE_ADDRESS
const coinAddress =
    COIN_ADDRESS

const PRIVATE_KEY = '0xd1b1905f11e418345712c49e3e014e8f322ebae38f248398941477b12b638822'

const singer = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(PRIVATE_KEY),
})

const MOCK_USDC_COIN_STORE = `0x1::coin::CoinStore<${coinAddress}::usdc::USDC>`
const MOCK_USDT_COIN_STORE = `0x1::coin::CoinStore<${coinAddress}::usdt::USDT>`
const MOCK_LP_COIN_STORE = `0x1::coin::CoinStore<${moduleAddress}::lp::LP>`

//vault
const APTOS_VAULT_ADDRESS = APTOS_COIN
const USDC_VAULT_ADDRESS = `${coinAddress}::usdc::USDC`
const USDT_VAULT_ADDRESS = `${coinAddress}::usdt::USDT`
const BTC_VAULT_ADDRESS = `${coinAddress}::btc::BTC`
const ETH_VAULT_ADDRESS = `${coinAddress}::ETH::ETH`
//symbol
const BTC_SYMBOL_ADDRESS = `${coinAddress}::btc::BTC`
const ETH_SYMBOL_ADDRESS = `${coinAddress}::ETH::ETH`
const BNB_SYMBOL_ADDRESS = `${coinAddress}::BNB::BNB`
const SOL_SYMBOL_ADDRESS = `${coinAddress}::SOL::SOL`
const AVAX_SYMBOL_ADDRESS = `${coinAddress}::AVAX::AVAX`
const APTOS_SYMBOL_ADDRESS = APTOS_COIN
const DOGE_SYMBOL_ADDRESS = `${coinAddress}::DOGE::DOGE`
const PEPE_SYMBOL_ADDRESS = `${coinAddress}::PEPE::PEPE`

//direction
const SIDE_LONG = `${moduleAddress}::pool::LONG`
const SIDE_SHORT = `${moduleAddress}::pool::SHORT`
//fee
const FEE_ADDRESS = APTOS_COIN
//list
const VAULT_LIST = [
    {
        name: 'APT',
        vaultType: APTOS_VAULT_ADDRESS,
        weight: formatAptosDecimal(0.05, 18),
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            APT_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
    },
    {
        name: 'USDC',
        vaultType: USDC_VAULT_ADDRESS,
        weight: formatAptosDecimal(0.3, 18),
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            USDC_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
    },
    {
        name: 'USDT',
        vaultType: USDT_VAULT_ADDRESS,
        weight: formatAptosDecimal(0.3, 18),
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            USDT_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
    },
    {
        name: 'BTC',
        vaultType: BTC_VAULT_ADDRESS,
        weight: formatAptosDecimal(0.2, 18),
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            BTC_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
    },
    {
        name: 'ETH',
        vaultType: ETH_VAULT_ADDRESS,
        weight: formatAptosDecimal(0.15, 18),
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            ETH_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
    },
]
const SYMBOL_LIST = [
    {
        name: 'BTC',
        symbolType: BTC_SYMBOL_ADDRESS,
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            BTC_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
        param_max: '7500000000000000',
        max_leverage: 100,
        min_holding_duration: 20,
        max_reserved_multiplier: 20,
        min_collateral_value: formatAptosDecimal(5, 18),
        open_fee_bps: formatAptosDecimal(0.001, 18),
        decrease_fee_bps: formatAptosDecimal(0.001, 18),
        liquidation_threshold: formatAptosDecimal(0.98, 18),
        liquidation_bonus: '10000000000000000',
    },
    {
        name: 'ETH',
        symbolType: ETH_SYMBOL_ADDRESS,
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            ETH_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
        param_max: '7500000000000000',
        max_leverage: 100,
        min_holding_duration: 20,
        max_reserved_multiplier: 20,
        min_collateral_value: formatAptosDecimal(5, 18),
        open_fee_bps: formatAptosDecimal(0.001, 18),
        decrease_fee_bps: formatAptosDecimal(0.001, 18),
        liquidation_threshold: formatAptosDecimal(0.98, 18),
        liquidation_bonus: '10000000000000000',
    },
    {
        name: 'BNB',
        symbolType: BNB_SYMBOL_ADDRESS,
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            BNB_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
        param_max: '7500000000000000',
        max_leverage: 100,
        min_holding_duration: 20,
        max_reserved_multiplier: 20,
        min_collateral_value: formatAptosDecimal(5, 18),
        open_fee_bps: formatAptosDecimal(0.001, 18),
        decrease_fee_bps: formatAptosDecimal(0.001, 18),
        liquidation_threshold: formatAptosDecimal(0.98, 18),
        liquidation_bonus: '10000000000000000',
    },
    {
        name: 'SOL',
        symbolType: SOL_SYMBOL_ADDRESS,
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            SOL_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
        param_max: '7500000000000000',
        max_leverage: 100,
        min_holding_duration: 20,
        max_reserved_multiplier: 20,
        min_collateral_value: formatAptosDecimal(5, 18),
        open_fee_bps: formatAptosDecimal(0.001, 18),
        decrease_fee_bps: formatAptosDecimal(0.001, 18),
        liquidation_threshold: formatAptosDecimal(0.98, 18),
        liquidation_bonus: '10000000000000000',
    },

    {
        name: 'AVAX',
        symbolType: AVAX_SYMBOL_ADDRESS,
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            AVAX_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
        param_max: '7500000000000000',
        max_leverage: 100,
        min_holding_duration: 20,
        max_reserved_multiplier: 20,
        min_collateral_value: formatAptosDecimal(5, 18),
        open_fee_bps: formatAptosDecimal(0.001, 18),
        decrease_fee_bps: formatAptosDecimal(0.001, 18),
        liquidation_threshold: formatAptosDecimal(0.98, 18),
        liquidation_bonus: '10000000000000000',
    },

    {
        name: 'APT',
        symbolType: APTOS_SYMBOL_ADDRESS,
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            APT_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
        param_max: '7500000000000000',
        max_leverage: 100,
        min_holding_duration: 20,
        max_reserved_multiplier: 20,
        min_collateral_value: formatAptosDecimal(5, 18),
        open_fee_bps: formatAptosDecimal(0.001, 18),
        decrease_fee_bps: formatAptosDecimal(0.001, 18),
        liquidation_threshold: formatAptosDecimal(0.98, 18),
        liquidation_bonus: '10000000000000000',
    },

    {
        name: 'DOGE',
        symbolType: DOGE_SYMBOL_ADDRESS,
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            DOGE_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
        param_max: '7500000000000000',
        max_leverage: 100,
        min_holding_duration: 20,
        max_reserved_multiplier: 20,
        min_collateral_value: formatAptosDecimal(5, 18),
        open_fee_bps: formatAptosDecimal(0.001, 18),
        decrease_fee_bps: formatAptosDecimal(0.001, 18),
        liquidation_threshold: formatAptosDecimal(0.98, 18),
        liquidation_bonus: '10000000000000000',
    },

    {
        name: 'PEPE',
        symbolType: PEPE_SYMBOL_ADDRESS,
        max_interval: 2000,
        max_price_confidence: '18446744073709551615',
        feeder:
            PEPE_FEEDER_ADDRESS,
        param_multiplier: '800000000000000',
        param_max: '7500000000000000',
        max_leverage: 100,
        min_holding_duration: 20,
        max_reserved_multiplier: 20,
        min_collateral_value: formatAptosDecimal(5, 18),
        open_fee_bps: formatAptosDecimal(0.001, 18),
        decrease_fee_bps: formatAptosDecimal(0.001, 18),
        liquidation_threshold: formatAptosDecimal(0.98, 18),
        liquidation_bonus: '10000000000000000',
    },
]
const DIRECTION_LIST = [SIDE_LONG, SIDE_SHORT]

function hexStringToUint8Array(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString;
    }
    const byteArray = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < byteArray.length; i++) {
        byteArray[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
    }
    return byteArray;
}

async function executeAddNewVault() {
    for (const vault of VAULT_LIST) {
        const transaction = await aptos.transaction.build.simple({
            sender: singer.accountAddress,
            data: {
                function: `${moduleAddress}::market::add_new_vault`,
                typeArguments: [vault.vaultType],
                functionArguments: [
                    vault.weight,
                    vault.max_interval,
                    vault.max_price_confidence,
                    hexStringToUint8Array(vault.feeder),
                    vault.param_multiplier,
                ],
            },
        })

        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: singer,
            transaction,
        })

        const response = await aptos.waitForTransaction({
            transactionHash: committedTransaction.hash
        })
        console.log(
            `🚀 ~ Transaction submitted Add new Vault : ${vault.name}`,
            response
        )
    }
}

async function executeAddNewSymbol() {
    for (const symbol of SYMBOL_LIST) {
        for (const direction of DIRECTION_LIST) {
            console.log(`🚀 ~ Add new Symbol Execute ~ symbol:${symbol.name}, direction:${direction} `)
            const transaction = await aptos.transaction.build.simple({
                sender: singer.accountAddress,
                data: {
                    function: `${moduleAddress}::market::add_new_symbol`,
                    typeArguments: [symbol.symbolType, direction],
                    functionArguments: [
                        symbol.max_interval,
                        symbol.max_price_confidence,
                        hexStringToUint8Array(symbol.feeder),
                        symbol.param_multiplier,
                        symbol.param_max,
                        symbol.max_leverage,
                        symbol.min_holding_duration,
                        symbol.max_reserved_multiplier,
                        symbol.min_collateral_value,
                        symbol.open_fee_bps,
                        symbol.decrease_fee_bps,
                        symbol.liquidation_threshold,
                        symbol.liquidation_bonus,
                    ],
                },
            })

            const committedTransaction = await aptos.signAndSubmitTransaction({
                signer: singer,
                transaction,
            })

            const response = await aptos.waitForTransaction({
                transactionHash: committedTransaction.hash
            })

            console.log(
                `🚀 ~ Transaction submitted Add new Symbol : ${symbol.name}`,
                response
            )
        }
    }
}

async function executeAddCollateralToSymbol() {
    for (const vault of VAULT_LIST) {
        for (const symbol of SYMBOL_LIST) {
            for (const direction of DIRECTION_LIST) {
                console.log(`🚀 ~ Add new Vault Execute ~ vault:${vault.name}, symbol:${symbol.name}, direction:${direction} `)

                const transaction = await aptos.transaction.build.simple({
                    sender: singer.accountAddress,
                    data: {
                        function: `${moduleAddress}::market::add_collateral_to_symbol`,
                        typeArguments: [
                            vault.vaultType, symbol.symbolType, direction
                        ],
                        functionArguments: [],
                    },
                });

                try {
                    const committedTransaction = await aptos.signAndSubmitTransaction({
                        signer: singer,
                        transaction,
                    });
                    const response = await aptos.waitForTransaction({
                        transactionHash: committedTransaction.hash
                    })
                    console.log(`🚀 ~ Transaction submitted Collateral => Symbol`, response);
                } catch (error) {
                    console.log("🚀 ~ executeAddCollateralToSymbol ~ error:", error)

                }

            }
        }
    }
}

async function main() {
    // await executeAddNewVault()
    // await executeAddNewSymbol()
    await executeAddCollateralToSymbol()
}

(async () => {
    await main()
})()