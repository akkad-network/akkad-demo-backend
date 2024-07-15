import { APTOS_COIN } from "@aptos-labs/ts-sdk"
import { aptos } from "src/main"

export const moduleAddress =
    "0x9e54d3231b270990fde73545f034dfa771696759e4f40ef8d5fc214cf88b4c6f"
export const coinAddress =
    "0x6f60af74988c64cd3b7c1e214697e6949db39c061d8d4cf59a7e2bd1b66c8bf0"

export const USDC_COINSTORE = `${coinAddress}::usdc::USDC`
export const ETH_COINSTORE = `${coinAddress}::ETH::ETH`
export const SIDE_LONG = `${moduleAddress}::pool::LONG`
export const SIDE_SHORT = `${moduleAddress}::pool::SHORT`

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

/*//////////////////////////////////////////////////////////////
                   APTOS => APTOS ETH BTC
//////////////////////////////////////////////////////////////*/

export const APTOS_APTOS_SHORT_ORDER = {
    open_orders: "0xfbc084d4258a1bf83ff2e5d9a347566ac54c9ab5b21d0529f404d5460c3696b4",
    decrease_orders: "0x1654a3c5ce4edd2f48f3bd1dd16a0733a4f5f6b8a19b513d9b70b740904c573d",
    direction: 'SHORT',
    vault: 'APTOS',
    symbol: 'APTOS'
}

export const APTOS_ETH_SHORT_ORDER = {
    direction: 'SHORT',
    open_orders: "0x2fa2a03f595666712ca97b018d82a62c1f38aa995330f340ecda51650cb0046f",
    decrease_orders: "0xeb08ba0d78c764c55c951db07477d45f9bc31cfddb3e480a4c69ac544feb269e",
    vault: 'APTOS',
    symbol: 'ETH'
}

export const APTOS_BTC_SHORT_ORDER = {
    direction: 'SHORT',
    open_orders: "0xb517a3e6a70d26dc488f97e33bc40e1608f00f38009f20e2e559c1705b5996c3",
    decrease_orders: "0xfbc642e80a54692f717cac6e34d13df7b2966cf3cd5b7ac6726805886b59d81b",
    vault: 'APTOS',
    symbol: 'BTC'
}


/*//////////////////////////////////////////////////////////////
                   USDC => APTOS ETH BTC
//////////////////////////////////////////////////////////////*/

export const USDC_APTOS_LONG_ORDER =
{
    direction: 'LONG',
    open_orders: "0x470ab9346c062f4159e5141e8848fd92d8e0da46079ffe28b478adf71b260153",
    decrease_orders: "0x77c1a33bcfd77dc9b00f4a951c1fd014f18ee7d5db776a368a7a90bbcdfe162a",
    vault: 'USDC',
    symbol: 'APTOS'
}
export const USDC_APTOS_SHORT_ORDER = {
    direction: 'SHORT',
    open_orders: "0xf40ffcceef362f95f2768c8ace2a7284e60360288d4ed6107c9a7bf572f15b41",
    decrease_orders: "0x7266e4f3ee06e741eaaad80cbf9763058694b6d86ee4ca9d1472af7b59822118",
    vault: 'USDC',
    symbol: 'APTOS'
}

export const USDC_ETH_LONG_ORDER = {
    direction: 'LONG',
    open_orders: "0xb05aa628a7f126c64a3f051c5bc4026da360e732b0cf93b86e5917e56bf9842b",
    decrease_orders: "0x15bd2b1ce5482c4552a6a748e3cac2f1d27c8a6d40059be254a2dfd024845f2b",
    vault: 'USDC',
    symbol: 'ETH'
}

export const USDC_ETH_SHORT_ORDER = {
    direction: 'SHORT',
    open_orders: "0x66114fbff41c326207b9ad373904f0718ff30b6a280be3a94549b2e78da945be",
    decrease_orders: "0xf562337e4e7747dff4b2affc9e19a9bd000311d728b32144c8e1d197c2a39121",
    vault: 'USDC',
    symbol: 'ETH'
}

export const USDC_BTC_LONG_ORDER = {
    direction: 'LONG',
    open_orders: "0x946c34eb3eb4100ffc21eeb3c54ffd8c3d2ff07f0f6122ce5e0090b49d711b30",
    decrease_orders: "0x2f4dc73468dcac3962bfb7108dea881ed637cfab717982e4a9a568cb01801aa0",
    vault: 'USDC',
    symbol: 'BTC'
}

export const USDC_BTC_SHORT_ORDER = {
    direction: 'SHORT',
    open_orders: "0x3a7c86b39fe1da18832699bbead0adb782239153a96174a898f2b19ef6276b3a",
    decrease_orders: "0xcf69b54e2fc43d98414c137ef6c29dda86e4da35ec46a4f672ac4b5bf256620",
    vault: 'USDC',
    symbol: 'BTC'
}

/*//////////////////////////////////////////////////////////////
                   USDT => APTOS ETH BTC
//////////////////////////////////////////////////////////////*/

export const USDT_APTOS_LONG_ORDER = {
    direction: 'LONG',
    open_orders: "0x3ab05f1388fd3b588a2a7e435338c9364f1da3061b5c037baa4a750a11fb60cc",
    decrease_orders: "0x969d5c0300ce8e8b7b7adc46ffa82bb0d96a2984983dd4b7a7f53fe0ffa44bd3",
    vault: 'USDT',
    symbol: 'APTOS'
}

export const USDT_APTOS_SHORT_ORDER = {
    direction: 'SHORT',
    open_orders: "0xcf13e1526ba451c9411b5136119434daa60bb01e1c2b11e41b8fda3a873a9139",
    decrease_orders: "0x3c8d2b400779fb669654c6d3504e47afaad45e9f085cab9fde66a284b4f7d884",
    vault: 'USDT',
    symbol: 'APTOS'
}

export const USDT_ETH_LONG_ORDER = {
    direction: 'LONG',
    open_orders: "0xbb8b779d8cf9aece353711656880f79fe2aa37944a4e322de15d43516992316c",
    decrease_orders: "0x303d7590e517a40c471e776232bbecd9f3d56976d6223a35d030a7c69b0a7fd7",
    vault: 'USDT',
    symbol: 'ETH'
}

export const USDT_BTC_LONG_ORDER = {
    open_orders: "0x2b373585fbbaeb0d9b606bfb12c47ee71267bfed5f088dc827677ce5b87c9088",
    decrease_orders: "0x5f9486a58ee03864f11119dc9ff203ccc52cc4c2bb321c8ebbfef569bea8f939",
    vault: 'USDT',
    symbol: 'BTC',
    direction: 'LONG',
}

export const ORDER_RECORD_TABLE_HANDLE = [
    // APTOS_APTOS_SHORT_ORDER,
    // APTOS_ETH_SHORT_ORDER,
    // APTOS_BTC_SHORT_ORDER,
    USDC_APTOS_LONG_ORDER,
    USDC_APTOS_SHORT_ORDER,
    // USDC_ETH_LONG_ORDER,
    // USDC_ETH_SHORT_ORDER,
    // USDC_BTC_LONG_ORDER,
    // USDC_BTC_SHORT_ORDER,
    // USDT_APTOS_LONG_ORDER,
    // USDT_APTOS_SHORT_ORDER,
    // USDT_ETH_LONG_ORDER,
    // USDT_BTC_LONG_ORDER
]


/*//////////////////////////////////////////////////////////////
                      USDT => APTOS APTOS
//////////////////////////////////////////////////////////////*/
export const APTOS_APTOS_SHORT = {
    vault: 'APTOS',
    symbol: 'APTOS',
    direction: 'SHORT',
    tableHandle: "0xda3853a988c0016cc94fb890c298a006a21071614c2572c1f873341164f73ca9"
}

export const APTOS_ETH_SHORT = {
    vault: 'APTOS',
    symbol: 'ETH',
    direction: 'SHORT',
    tableHandle: "0x38862d97ab857b00db6de78989e4cbcbbf8c131ee16cf6aed4d818afdca6cd89"
}

export const APTOS_BTC_SHORT = {
    vault: 'APTOS',
    symbol: 'BTC',
    direction: 'SHORT',
    tableHandle: "0x5207a556eac0abfbcb55343659607ca48dca15297d55372e642c877a0744331e"
}


/*//////////////////////////////////////////////////////////////
                   USDC => APTOS ETH BTC
//////////////////////////////////////////////////////////////*/
export const USDC_APTOS_LONG = {
    vault: 'USDC',
    symbol: 'APTOS',
    direction: 'LONG',
    tableHandle: "0x5d04730e7a8674846eb51f675da62ed1d39c3c52a82969400c9cbc57f2377d2b"
}

export const USDC_APTOS_SHORT = {
    vault: 'USDC',
    symbol: 'APTOS',
    direction: 'SHORT',
    tableHandle: "0x52266174864d1d9db90f08c7bc7f986d4e332260b76e9e3b074e1599c9769778"
}

export const USDC_ETH_LONG = {
    vault: 'USDC',
    symbol: 'ETH',
    direction: 'LONG',
    tableHandle: "0x24b03590827b2bf84932a23be8c4eb6a7e666f992fe40cde3f5d7629242b8151"
}

export const USDC_ETH_SHORT = {
    vault: 'USDC',
    symbol: 'ETH',
    direction: 'SHORT',
    tableHandle: "0xd243a217b49e52e353adde21b29d77d3a2c26ec161354a48a100a40eabfd59b6"
}

export const USDC_BTC_LONG = {
    vault: 'USDC',
    symbol: 'BTC',
    direction: 'LONG',
    tableHandle: "0xd3521c6366d5c4359fb9b0e50df112b02b66bcc80e305eb2bf7b922ffc722f7c"
}

export const USDC_BTC_SHORT = {
    vault: 'USDC',
    symbol: 'BTC',
    direction: 'SHORT',
    tableHandle: "0x3eeb72b275669ca51b44d6fe3f92d0a45396d1edf7d7f76c802a2c7c0c211542"
}


/*//////////////////////////////////////////////////////////////
                      USDT => APTOS ETH BTC
//////////////////////////////////////////////////////////////*/

export const USDT_APTOS_LONG = {
    vault: 'USDT',
    symbol: 'APTOS',
    direction: 'LONG',
    tableHandle: "0xcfca3b864609a9d5591b3a98cf5c6711e9cf70f1af18a2cb1d47bfd1376bd497"
}

export const USDT_APTOS_SHORT = {
    vault: 'USDT',
    symbol: 'APTOS',
    direction: 'SHORT',
    tableHandle: "0xb652da3f1656c0c9c6040de8ead310b80f9453f2246a4d05dc0ffc65786f4ea7"
}

export const USDT_ETH_LONG = {
    vault: 'USDT',
    symbol: 'ETH',
    direction: 'LONG',
    tableHandle: "0x86847f1733fb08655d500f24702cb7826626b4b18f55ff36bd9134abb27dbd"
}

export const USDT_BTC_LONG = {
    vault: 'USDT',
    symbol: 'BTC',
    direction: 'LONG',
    tableHandle: "0x6df393cf738492af56cbbc263f45667573723d9b20b3c770519e298921f06cc4"
}

export const POSITION_RECORDS_TABLE_HANDLE = [
    APTOS_APTOS_SHORT,
    APTOS_ETH_SHORT,
    APTOS_BTC_SHORT,
    USDC_APTOS_LONG,
    USDC_APTOS_SHORT,
    USDC_ETH_LONG,
    USDC_ETH_SHORT,
    USDC_BTC_LONG,
    USDC_BTC_SHORT,
    USDT_APTOS_LONG,
    USDT_APTOS_SHORT,
    USDT_ETH_LONG,
    USDT_BTC_LONG,
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