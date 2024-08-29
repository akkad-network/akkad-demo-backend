import { Injectable, Logger } from '@nestjs/common';
import { PositionRecord } from '@prisma/client';
import { aptos, liquidatorSigner, MODULE_ADDRESS } from 'src/main';
import { getSideAddress, SymbolList, VaultList } from 'src/utils/helper';

export class LiquidatorService {
    private readonly logger = new Logger(LiquidatorService.name)

    private readonly moduleAddress: string = MODULE_ADDRESS

    constructor() { }

    async executeLiquidation(position: PositionRecord) {
        this.logger.log("🚀 ~ execute Liquidation ~ Order ", `${position.id} ${position.order_id} ${position.owner} ${position.vault} ${position.symbol} ${position.direction}`)
        const accountInfo = await aptos.account.getAccountInfo({ accountAddress: liquidatorSigner.accountAddress })
        const seqNumber = accountInfo.sequence_number
        const transaction = await aptos.transaction.build.simple({
            sender: liquidatorSigner.accountAddress,
            data: {
                function: `${this.moduleAddress}::market::liquidate_position`,
                typeArguments: [
                    VaultList.find(vault => vault.name === position.vault).tokenAddress,
                    SymbolList.find(symbol => symbol.tokenName === position.symbol).tokenAddress,
                    getSideAddress(position.direction),
                ],
                functionArguments: [
                    position.owner,
                    position.order_id,
                    []
                ],
            },
        });
        const committedTransaction = await aptos.signAndSubmitTransaction({
            signer: liquidatorSigner,
            transaction,
        });

        const response = await aptos.waitForTransaction({
            transactionHash: committedTransaction.hash
        })
        this.logger.verbose("🚀 ~ Execute Liquidation ~", response.success.toString())

        if (response.success) {
            //TODO UPDATE DATABASE
            this.logger.verbose("🚀 ~ Execute Liquidation Success~", response.toString())
        } else {
            //TODO ERROR FIX
            this.logger.verbose("🚀 ~ Execute Liquidation Error~", response.toString())
        }
    }
}
