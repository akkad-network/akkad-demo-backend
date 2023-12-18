import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { abi as executorAssistantABI } from 'artifacts/contracts/misc/ExecutorAssistant.sol/ExecutorAssistant.json';
import { CalculateMulticallResponseDto } from './chain-executor.dto';

@Injectable()
export class ChainExecutorService {
  private provider: ethers.JsonRpcProvider;
  private executorAssistantContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      'https://arb-sepolia.g.alchemy.com/v2/RCtmHaPSrWs8prthWD31jNbk_0wEwp0j',
    );

    this.executorAssistantContract = new ethers.Contract(
      '0x93f3758e4DD91a9f0Ffc6474D6621d704a91C6d9',
      executorAssistantABI,
      this.provider,
    );
  }

  async getExecutorAssistantQueryResult(): Promise<CalculateMulticallResponseDto> {
    const [pools, indexPerOperations] =
      await this.executorAssistantContract.calculateNextMulticall(3);

    pools.forEach((poolAddress, index) => {
      console.log(`Pool ${index}: ${poolAddress}`);
    });

    console.log('pools ', pools);
    console.log('indexPerOperations ', indexPerOperations);

    indexPerOperations.forEach((operation, opIndex) => {
      console.log(`Operation ${opIndex}:`);
      console.log(`  - Start Index: ${operation.index}`);
      console.log(`  - Next Index: ${operation.indexNext}`);
      console.log(`  - End Index: ${operation.indexEnd}`);
    });

    return {
      pools: pools.map((pool) => pool.toString()),
      indexPerOperations: indexPerOperations.map((op) => ({
        index: op.index.toNumber(),
        indexNext: op.indexNext.toNumber(),
        indexEnd: op.indexEnd.toNumber(),
      })),
    };
  }
}
