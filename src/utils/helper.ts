import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { aptos } from "src/main"
import * as dotenv from 'dotenv'
dotenv.config()

export const MODULE_ADDRESS = process.env.MODULE_ADDRESS
export const COIN_ADDRESS = process.env.COIN_ADDRESS

export const USDC_COINSTORE = `${COIN_ADDRESS}::usdc::USDC`
export const ETH_COINSTORE = `${COIN_ADDRESS}::ETH::ETH`
export const SIDE_LONG = `${MODULE_ADDRESS}::pool::LONG`
export const SIDE_SHORT = `${MODULE_ADDRESS}::pool::SHORT`

export const APTOS_COIN_STORE = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
export const MOCK_USDC_COIN_STORE = `0x1::coin::CoinStore<${COIN_ADDRESS}::usdc::USDC>`
export const MOCK_USDT_COIN_STORE = `0x1::coin::CoinStore<${COIN_ADDRESS}::usdt::USDT>`
export const MOCK_BTC_COIN_STORE = `0x1::coin::CoinStore<${COIN_ADDRESS}::btc::BTC>`
export const MOCK_ETH_COIN_STORE = `0x1::coin::CoinStore<${COIN_ADDRESS}::ETH::ETH>`

export const CHECK_LIQUIDATION_FUNC_PATH = `${MODULE_ADDRESS}::positions::check_liquidation`

export type SymbolInfo = {
    name: string
    tokenName: string
    tokenSymbol: string
    tokenAddress: string
    pythFeederAddress: string
    decimal: number
}

export type VaultInfo = {
    name: string,
    symbol: string,
    tokenAddress: string,
    tokenStore: string,
    decimal: number
}
export const TYPES = [
    'PositionRecord',
    'OrderRecord'
]

export const DIRECTION = [
    { name: 'LONG', address: SIDE_LONG }, { name: 'SHORT', address: SIDE_SHORT }
]

export const VaultList: VaultInfo[] = [
    {
        name: 'APTOS',
        symbol: 'APT',
        tokenAddress: APTOS_COIN,
        tokenStore: APTOS_COIN_STORE,
        decimal: 8
    },
    {
        name: 'USDT',
        symbol: 'USDT',
        tokenAddress: `${COIN_ADDRESS}::usdt::USDT`,
        tokenStore: MOCK_USDT_COIN_STORE,
        decimal: 6
    },
    {
        name: 'USDC',
        symbol: 'USDC',
        tokenAddress: `${COIN_ADDRESS}::usdc::USDC`,
        tokenStore: MOCK_USDC_COIN_STORE,
        decimal: 6
    },
    {
        name: 'BTC',
        symbol: 'BTC',
        tokenAddress: `${COIN_ADDRESS}::btc::BTC`,
        tokenStore: MOCK_BTC_COIN_STORE,
        decimal: 8
    },
    {
        name: 'ETH',
        symbol: 'ETH',
        tokenAddress: `${COIN_ADDRESS}::ETH::ETH`,
        tokenStore: MOCK_ETH_COIN_STORE,
        decimal: 8
    }
]

export const SymbolList: SymbolInfo[] = [
    {
        name: "APTOS/USD",
        tokenName: 'APTOS',
        tokenSymbol: 'APT',
        tokenAddress: APTOS_COIN,
        pythFeederAddress: "0x44a93dddd8effa54ea51076c4e851b6cbbfd938e82eb90197de38fe8876bb66e",
        decimal: 8
    },
    {
        name: "BTC/USD",
        tokenName: 'BTC',
        tokenSymbol: 'BTC',
        tokenAddress: `${COIN_ADDRESS}::btc::BTC`,
        pythFeederAddress: "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
        decimal: 8
    },
    {
        name: "ETH/USD",
        tokenName: 'ETH',
        tokenSymbol: 'ETH',
        tokenAddress: `${COIN_ADDRESS}::ETH::ETH`,
        pythFeederAddress: "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
        decimal: 8
    },
    {
        name: "BNB/USD",
        tokenName: 'BNB',
        tokenSymbol: 'BNB',
        tokenAddress: `${COIN_ADDRESS}::BNB::BNB`,
        pythFeederAddress: "ecf553770d9b10965f8fb64771e93f5690a182edc32be4a3236e0caaa6e0581a",
        decimal: 8
    },
    {
        name: "SOL/USD",
        tokenName: 'SOL',
        tokenSymbol: 'SOL',
        tokenAddress: `${COIN_ADDRESS}::SOL::SOL`,
        pythFeederAddress: "fe650f0367d4a7ef9815a593ea15d36593f0643aaaf0149bb04be67ab851decd",
        decimal: 8
    },
    {
        name: "AVAX/USD",
        tokenName: 'AVAX',
        tokenSymbol: 'AVAX',
        tokenAddress: `${COIN_ADDRESS}::AVAX::AVAX`,
        pythFeederAddress: "d7566a3ba7f7286ed54f4ae7e983f4420ae0b1e0f3892e11f9c4ab107bbad7b9",
        decimal: 8
    },
    {
        name: "PEPE/USD",
        tokenName: 'PEPE',
        tokenSymbol: 'PEPE',
        tokenAddress: `${COIN_ADDRESS}::PEPE::PEPE`,
        pythFeederAddress: "ed82efbfade01083ffa8f64664c86af39282c9f084877066ae72b635e77718f0",
        decimal: 8
    },
    {
        name: "DOGE/USD",
        tokenName: 'DOGE',
        tokenSymbol: 'DOGE',
        tokenAddress: `${COIN_ADDRESS}::DOGE::DOGE`,
        pythFeederAddress: "31775e1d6897129e8a84eeba975778fb50015b88039e9bc140bbd839694ac0ae",
        decimal: 8
    },

]


export type APTOS_ADDRESS = `${string}::${string}::${string}`


export const PAIRS = [
    { vault: 'APTOS', symbol: 'APTOS', direction: 'LONG' },
    { vault: 'APTOS', symbol: 'APTOS', direction: 'SHORT' },
    { vault: 'APTOS', symbol: 'ETH', direction: 'LONG' },
    { vault: 'APTOS', symbol: 'ETH', direction: 'SHORT' },
    { vault: 'APTOS', symbol: 'BTC', direction: 'LONG' },
    { vault: 'APTOS', symbol: 'BTC', direction: 'SHORT' },

    { vault: 'USDC', symbol: 'APTOS', direction: 'LONG' },
    { vault: 'USDC', symbol: 'APTOS', direction: 'SHORT' },
    { vault: 'USDC', symbol: 'ETH', direction: 'LONG' },
    { vault: 'USDC', symbol: 'ETH', direction: 'SHORT' },
    { vault: 'USDC', symbol: 'BTC', direction: 'LONG' },
    { vault: 'USDC', symbol: 'BTC', direction: 'SHORT' },

    { vault: 'USDT', symbol: 'APTOS', direction: 'LONG' },
    { vault: 'USDT', symbol: 'APTOS', direction: 'SHORT' },
    { vault: 'USDT', symbol: 'ETH', direction: 'LONG' },
    { vault: 'USDT', symbol: 'ETH', direction: 'SHORT' },
    { vault: 'USDT', symbol: 'BTC', direction: 'LONG' },
    { vault: 'USDT', symbol: 'BTC', direction: 'SHORT' },
]

export const getTableHandle = async (address: string, resourceType: `${string}::${string}::${string}`) => {
    const result = await aptos.getAccountResource({
        accountAddress: address,
        resourceType: resourceType
    })
    return { result }
}

export const getOrderRecordResources = (coinType: `${string}::${string}::${string}`, index: `${string}::${string}::${string}`, direction: string, fee: `${string}::${string}::${string}`) => {
    return `${MODULE_ADDRESS}::market::OrderRecord<${coinType},${index},${MODULE_ADDRESS}::pool::${direction},${fee}>` as `${string}::${string}::${string}`
}

export const convertDecimal = (value: number, fromDecimals: number = 8, toDecimals: number = 18) => {
    if (toDecimals < fromDecimals) {
        throw new Error("Target decimals must be greater than or equal to source decimals");
    }
    const factor = Math.pow(10, toDecimals - fromDecimals);
    return value * factor;
}

export const convertBackDecimal = (value: number | string | bigint, decimal: number = 8): number => {
    const bigIntValue = BigInt(value);
    const factor = BigInt(10 ** decimal);

    const result = Number(bigIntValue) / Number(factor);

    return result;
}

export const parseAptosDecimal = (value: number, decimals: number = 8) => {
    return value / Math.pow(10, decimals);
}

export const formatAptosDecimal = (value: number, decimals: number = 8) => {
    return Number((value * Math.pow(10, decimals)).toFixed(0));
}

export const getSideAddress = (side: string) => {
    return `${MODULE_ADDRESS}::pool::${side}`
}