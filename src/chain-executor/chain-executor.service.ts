import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { abi as executorAssistantABI } from 'artifacts/contracts/misc/ExecutorAssistant.sol/ExecutorAssistant.json';
import { abi as executorABI } from 'artifacts/contracts/misc/MixedExecutorV2.sol/MixedExecutorV2.json';
import { CalculateMulticallResponseDto } from './chain-executor.dto';

@Injectable()
export class ChainExecutorService {
  private provider: ethers.JsonRpcProvider;
  private executorAssistantContract: ethers.Contract;
  private executorContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      'https://arb-sepolia.g.alchemy.com/v2/RCtmHaPSrWs8prthWD31jNbk_0wEwp0j',
    );

    this.executorAssistantContract = new ethers.Contract(
      '0x93f3758e4DD91a9f0Ffc6474D6621d704a91C6d9',
      executorAssistantABI,
      this.provider,
    );

    this.executorContract = new ethers.Contract(
      '0x93f3758e4DD91a9f0Ffc6474D6621d704a91C6d9',
      executorABI,
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

  async executorHandler(): Promise<any> {
    const calls = [
      this.executorContract.encodeFunctionData('setPriceX96s', []),
      this.executorContract.encodeFunctionData(
        'executeOpenLiquidityPositions',
        [],
      ),
      this.executorContract.encodeFunctionData(
        'executeCloseLiquidityPositions',
        [],
      ),
      this.executorContract.encodeFunctionData(
        'executeAdjustLiquidityPositionMargins',
        [],
      ),
      this.executorContract.encodeFunctionData(
        'executeIncreaseRiskBufferFundPositions',
        [],
      ),
      this.executorContract.encodeFunctionData(
        'executeDecreaseRiskBufferFundPositions',
        [],
      ),
      this.executorContract.encodeFunctionData('executeIncreasePositions', []),
      this.executorContract.encodeFunctionData('executeDecreasePositions', []),
      this.executorContract.encodeFunctionData(
        'sampleAndAdjustFundingRateBatch',
        [],
      ),
      this.executorContract.encodeFunctionData('collectProtocolFeeBatch', []),
      this.executorContract.encodeFunctionData('executeIncreaseOrder', []),
      this.executorContract.encodeFunctionData('executeDecreaseOrder', []),
      this.executorContract.encodeFunctionData(
        'liquidateLiquidityPosition',
        [],
      ),
      this.executorContract.encodeFunctionData('liquidatePosition', []),
    ];

    const result = await this.executorContract.aggregate(calls);

    const decodedResult1 = this.executorContract.interface.decodeFunctionResult(
      'setPriceX96s',
      result.returnData[0],
    );
    const decodedResult2 = this.executorContract.interface.decodeFunctionResult(
      'executeOpenLiquidityPositions',
      result.returnData[1],
    );
    const decodedResult3 = this.executorContract.interface.decodeFunctionResult(
      'executeCloseLiquidityPositions',
      result.returnData[0],
    );
    const decodedResult4 = this.executorContract.interface.decodeFunctionResult(
      'executeAdjustLiquidityPositionMargins',
      result.returnData[1],
    );
    const decodedResult5 = this.executorContract.interface.decodeFunctionResult(
      'executeIncreaseRiskBufferFundPositions',
      result.returnData[0],
    );
    const decodedResult6 = this.executorContract.interface.decodeFunctionResult(
      'executeDecreaseRiskBufferFundPositions',
      result.returnData[1],
    );
    const decodedResult7 = this.executorContract.interface.decodeFunctionResult(
      'executeIncreasePositions',
      result.returnData[0],
    );
    const decodedResult8 = this.executorContract.interface.decodeFunctionResult(
      'executeDecreasePositions',
      result.returnData[1],
    );
    const decodedResult9 = this.executorContract.interface.decodeFunctionResult(
      'sampleAndAdjustFundingRateBatch',
      result.returnData[0],
    );
    const decodedResult10 =
      this.executorContract.interface.decodeFunctionResult(
        'collectProtocolFeeBatch',
        result.returnData[1],
      );
    const decodedResult11 =
      this.executorContract.interface.decodeFunctionResult(
        'executeIncreaseOrder',
        result.returnData[0],
      );
    const decodedResult12 =
      this.executorContract.interface.decodeFunctionResult(
        'executeDecreaseOrder',
        result.returnData[1],
      );
    const decodedResult13 =
      this.executorContract.interface.decodeFunctionResult(
        'liquidateLiquidityPosition',
        result.returnData[0],
      );
    const decodedResult14 =
      this.executorContract.interface.decodeFunctionResult(
        'liquidatePosition',
        result.returnData[1],
      );
    // Decode other function results...

    return {
      result1: decodedResult1,
      result2: decodedResult2,
      result3: decodedResult3,
      result4: decodedResult4,
      result5: decodedResult5,
      result6: decodedResult6,
      result7: decodedResult7,
      result8: decodedResult8,
      result9: decodedResult9,
      result10: decodedResult10,
      result11: decodedResult11,
      result12: decodedResult12,
      result13: decodedResult13,
      result14: decodedResult14,
    };
  }
}
