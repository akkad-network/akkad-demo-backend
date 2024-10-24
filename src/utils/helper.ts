import * as dotenv from 'dotenv'
dotenv.config()



export type SymbolInfo = {
    name: string
    tokenName: string
    tokenSymbol: string
    tokenAddress: string
    pythFeederAddress: string
    decimal: number
}
