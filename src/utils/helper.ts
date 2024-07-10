import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { aptos } from "src/main"

export const moduleAddress =
    "0x87e95448bc9088569ed1f9b724a1ec679a187a1c80ff49b52c305318956c4bb7"
export const coinAddress =
    "0x6f60af74988c64cd3b7c1e214697e6949db39c061d8d4cf59a7e2bd1b66c8bf0"


export const APTOS_COIN_STORE = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
export const MOCK_USDC_COIN_STORE = `0x1::coin::CoinStore<${coinAddress}::usdc::USDC>`
export const MOCK_USDT_COIN_STORE = `0x1::coin::CoinStore<${coinAddress}::usdt::USDT>`

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

export type APTOS_ADDRESS = `${string}::${string}::${string}`


export const APTOS_APTOS_ORDER_RECORD_LONG = {
    address: `${moduleAddress}::market::OrderRecord<${APTOS_COIN},${APTOS_COIN},${moduleAddress}::pool::LONG,${APTOS_COIN}>`,
    direction: 'LONG',
    vault: 'APTOS',
    symbol: 'APTOS'

}
export const APTOS_APTOS_ORDER_RECORD_SHORT = {
    address: `${moduleAddress}::market::OrderRecord<${APTOS_COIN},${APTOS_COIN},${moduleAddress}::pool::SHORT,${APTOS_COIN}>`,
    direction: 'SHORT',
    vault: 'APTOS',
    symbol: 'APTOS'
}


export const ORDER_RECORD_PAIR_LIST = [
    APTOS_APTOS_ORDER_RECORD_LONG,
    APTOS_APTOS_ORDER_RECORD_SHORT,
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