import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { aptos } from "src/main"

export const moduleAddress =
    "0x8d07663376c920257ab9f2bd8ef0cc5ed5f2264109a3d29fc2b6f8aafc5e875d"
export const coinAddress =
    "0x6f60af74988c64cd3b7c1e214697e6949db39c061d8d4cf59a7e2bd1b66c8bf0"

export const USDC_COINSTORE = `${coinAddress}::usdc::USDC`
export const ETH_COINSTORE = `${coinAddress}::ETH::ETH`
export const SIDE_LONG = `${moduleAddress}::pool::LONG`
export const SIDE_SHORT = `${moduleAddress}::pool::SHORT`

export const APTOS_COIN_STORE = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
export const MOCK_USDC_COIN_STORE = `0x1::coin::CoinStore<${coinAddress}::usdc::USDC>`
export const MOCK_USDT_COIN_STORE = `0x1::coin::CoinStore<${coinAddress}::usdt::USDT>`

export const CHECK_LIQUIDATION_FUNC_PATH = `${moduleAddress}::positions::check_liquidation`

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
        tokenAddress: `${coinAddress}::usdt::USDT`,
        tokenStore: MOCK_USDT_COIN_STORE,
        decimal: 6
    },
    {
        name: 'USDC',
        symbol: 'USDC',
        tokenAddress: `${coinAddress}::usdc::USDC`,
        tokenStore: MOCK_USDC_COIN_STORE,
        decimal: 6
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
        tokenAddress: `${coinAddress}::btc::BTC`,
        pythFeederAddress: "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b",
        decimal: 8
    },
    {
        name: "ETH/USD",
        tokenName: 'ETH',
        tokenSymbol: 'ETH',
        tokenAddress: `${coinAddress}::ETH::ETH`,
        pythFeederAddress: "0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6",
        decimal: 8
    }
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
    return `${moduleAddress}::market::OrderRecord<${coinType},${index},${moduleAddress}::pool::${direction},${fee}>` as `${string}::${string}::${string}`
}

export const convertDecimal = (value: number, fromDecimals: number = 8, toDecimals: number = 18) => {
    if (toDecimals < fromDecimals) {
        throw new Error("Target decimals must be greater than or equal to source decimals");
    }
    const factor = Math.pow(10, toDecimals - fromDecimals);
    return value * factor;
}

export const convertBackDecimal = (value: number | string | bigint, decimal: number = 8): bigint => {
    const bigIntValue = BigInt(value);
    const factor = BigInt(10 ** decimal);

    return bigIntValue / factor;
}

export const parseAptosDecimal = (value: number, decimals: number = 8) => {
    return value / Math.pow(10, decimals);
}

export const formatAptosDecimal = (value: number, decimals: number = 8) => {
    return Number((value * Math.pow(10, decimals)).toFixed(0));
}

export const getSideAddress = (side: string) => {
    return `${moduleAddress}::pool::${side}`
}