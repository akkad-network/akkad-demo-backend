

export type ChainInfoType = {
    index: number
    name: string
    desc: string
    chainIcon: string
    supportTokens: TokenInfoType[]
    chainId: number
    chainRpc: string
    chainExplorer: string
    aBTCVaultAddress?: string
    crossChainVaultAddress?: string
}

export type TokenInfoType = {
    name: string
    icon: string
    tokenAddress: string
}


export const ABTC: TokenInfoType = {
    name: 'ABTC', icon: '/coins/ABTC.svg', tokenAddress: ''
}

export const AkkadConfig: ChainInfoType = {
    index: 99,
    name: 'Akkad',
    desc: 'Akkad Network',
    chainIcon: '/chains/akkad.svg',
    supportTokens: [ABTC],
    chainId: 1000000,
    chainRpc: 'https://rpc-testnet.akkad.network',
    chainExplorer: 'https://scan-testnet.akkad.network',
    aBTCVaultAddress: '0xe685fCE7D8f895b6e6Ed9668033885b8B8d247e9',
    crossChainVaultAddress: ''
}

export const Holesky: ChainInfoType = {
    index: 1,
    name: 'Holesky',
    desc: 'Holesky Network',
    chainId: 17000,
    supportTokens: [{
        name: 'solvBTC',
        icon: '/coins/SolvBTC.png',
        tokenAddress: '0x80a28a43Fb80c147De500828051eeBC7fE56bE73'
    }, {
        name: 'pumpBTC',
        icon: '/coins/pumpBTC.webp',
        tokenAddress: '0x5605Db72116Dd85cB95327bA61e0cA4b6c0D4AfD'
    }],
    chainIcon: '/chains/akkad.svg',
    chainRpc: 'https://eth-holesky.g.alchemy.com/v2/AnjBvfjqIfNbilrdkgPI1P2qapA4Sots',
    chainExplorer: 'https://holesky.etherscan.io',
    aBTCVaultAddress: '',
    crossChainVaultAddress: '0x3BE42e443A1A4d7d44362F9a09897cc61384A60d'
}

export const Sepolia: ChainInfoType = {
    index: 0,
    name: 'Sepolia',
    desc: 'Sepolia Network',
    chainId: 11_155_111,
    supportTokens: [{
        name: 'solvBTC',
        icon: '/coins/SolvBTC.png',
        tokenAddress: '0x90Ef48Fbda0E6f01953B9F43e381858d3343208F'
    }, {
        name: 'pumpBTC',
        icon: '/coins/pumpBTC.webp',
        tokenAddress: '0xC772bEF85F7B78e35DF63a3bd4d38751FA9013cb'
    }],
    chainIcon: '/chains/akkad.svg',
    chainRpc: 'https://eth-sepolia.g.alchemy.com/v2/AnjBvfjqIfNbilrdkgPI1P2qapA4Sots',
    chainExplorer: 'https://sepolia.etherscan.io',
    aBTCVaultAddress: '',
    crossChainVaultAddress: '0x5Cb8769a1EDeE00d92586fB8D7B4F5B6595EEFD2'
}


export const ChainConfigList: ChainInfoType[] = [
    AkkadConfig,
    Holesky,
    Sepolia
]

export const SourceChainsList: ChainInfoType[] = [
    Holesky,
    Sepolia
]