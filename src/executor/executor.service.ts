import { APTOS_COIN } from '@aptos-labs/ts-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { DecreaseOrderRecord, IncreaseOrderRecord } from '@prisma/client';
import { aptos, executerSigner, MODULE_ADDRESS, } from 'src/main';
import { PrismaService } from 'src/prisma/prisma.service';
import { getSideAddress, parseAptosDecimal, SymbolList, VaultList } from 'src/utils/helper';

@Injectable()
export class ExecutorService {
    private readonly logger = new Logger(ExecutorService.name)

    private readonly moduleAddress: string = MODULE_ADDRESS

    constructor(private readonly prisma: PrismaService) { }

    async executeIncreaseOrder(order: IncreaseOrderRecord) {
        this.logger.log("🚀 ~ execute Increase ~ Order ", `${order.id} ${order.order_id} ${parseAptosDecimal(Number(order.limited_index_price), 18)} ${order.owner} ${order.vault} ${order.symbol} ${order.direction}`)
        try {
            const accountInfo = await aptos.account.getAccountInfo({ accountAddress: executerSigner.accountAddress })
            const seqNumber = accountInfo.sequence_number
            const transaction = await aptos.transaction.build.simple({
                sender: executerSigner.accountAddress,
                data: {
                    function: `${this.moduleAddress}::market::execute_open_position_order`,
                    typeArguments: [
                        VaultList.find(vault => vault.name === order.vault).tokenAddress,
                        SymbolList.find(symbol => symbol.tokenName === order.symbol).tokenAddress,
                        getSideAddress(order.direction),
                        APTOS_COIN,
                    ],
                    functionArguments: [
                        order.owner,
                        order.order_id,
                        []
                    ],
                },
            });

            const committedTransaction = await aptos.signAndSubmitTransaction({
                signer: executerSigner,
                transaction,
            });

            const response = await aptos.waitForTransaction({
                transactionHash: committedTransaction.hash
            })

            this.logger.verbose("🚀 ~ Execute Increase Order ~", response.success.toString())

            if (response.success) {
                await this.prisma.increaseOrderRecord.update({
                    data: {
                        executed: true,
                        status: 'DONE'
                    },
                    where: {
                        id: order.id,
                        vault: order.vault,
                        symbol: order.symbol,
                        direction: order.direction,
                    }
                })
            } else {
                this.logger.error("🚀 ~ Execute Increase Error~", response.toString())
            }
        } catch (error) {
            this.logger.error("🚀 ~ Execute Increase Error~ try catch", error)
            if (error.toString().indexOf("ERR_ORDER_ALREADY_EXECUTED") !== -1) {
                this.logger.error("🚀 ~ Execute Increase Error~ try catch", "ERR_ORDER_ALREADY_EXECUTED")
                await this.prisma.increaseOrderRecord.update({
                    data: {
                        executed: true,
                        status: 'ALREADY DONE'
                    },
                    where: {
                        id: order.id,
                        vault: order.vault,
                        symbol: order.symbol,
                        direction: order.direction,
                    }
                })
            } else if (error.toString().indexOf("ERR_ALREADY_CLOSED") !== -1) {
                await this.prisma.increaseOrderRecord.update({
                    data: {
                        executed: true,
                        status: 'ALREADY CLOSED'
                    },
                    where: {
                        id: order.id,
                        vault: order.vault,
                        symbol: order.symbol,
                        direction: order.direction,
                    }
                })
            }
        }

    }

    async executeDecreaseOrder(order: DecreaseOrderRecord) {
        this.logger.log("🚀 ~ execute Decrease ~ Order ", `${order.id} ${order.order_id} ${order.owner} ${order.vault} ${order.symbol} ${order.direction}`)
        try {
            const accountInfo = await aptos.account.getAccountInfo({ accountAddress: executerSigner.accountAddress })
            const transaction = await aptos.transaction.build.simple({
                sender: executerSigner.accountAddress,
                data: {
                    function: `${this.moduleAddress}::market::execute_decrease_position_order`,
                    typeArguments: [
                        VaultList.find(vault => vault.name === order.vault).tokenAddress,
                        SymbolList.find(symbol => symbol.tokenName === order.symbol).tokenAddress,
                        getSideAddress(order.direction),
                        APTOS_COIN,
                    ],
                    functionArguments: [
                        order.owner,
                        order.order_id,
                        order.position_num,
                        []
                    ],
                },
            });

            const committedTransaction = await aptos.signAndSubmitTransaction({
                signer: executerSigner,
                transaction,
            });

            const response = await aptos.waitForTransaction({
                transactionHash: committedTransaction.hash
            })

            this.logger.verbose("🚀 ~ Execute Decrease Order ~", response.success.toString())

            if (response.success) {
                await this.prisma.decreaseOrderRecord.update({
                    data: {
                        executed: true,
                        status: 'DONE'
                    },
                    where: {
                        id: order.id,
                        vault: order.vault,
                        symbol: order.symbol,
                        direction: order.direction,
                    }
                })
            } else {
                this.logger.error("🚀 ~ Execute Decrease Error~", response.toString())
            }
        } catch (error) {
            if (error.toString().indexOf("ERR_ORDER_ALREADY_EXECUTED")) {
                this.logger.error("🚀 ~ Execute Decrease Error~ try catch", "ERR_ORDER_ALREADY_EXECUTED")
                await this.prisma.decreaseOrderRecord.update({
                    data: {
                        executed: true,
                        status: 'ALREADY DONE'
                    },
                    where: {
                        id: order.id,
                        vault: order.vault,
                        symbol: order.symbol,
                        direction: order.direction,
                    }
                })
            } else if (error.toString().indexOf("ERR_ALREADY_CLOSED") !== -1) {
                await this.prisma.decreaseOrderRecord.update({
                    data: {
                        executed: true,
                        status: 'ALREADY CLOSED'
                    },
                    where: {
                        id: order.id,
                        vault: order.vault,
                        symbol: order.symbol,
                        direction: order.direction,
                    }
                })
            }
        }
    }
}
