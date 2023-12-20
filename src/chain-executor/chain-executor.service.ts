import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { abi as executorAssistantABI } from 'artifacts/contracts/misc/ExecutorAssistant.sol/ExecutorAssistant.json';
import { abi as executorABI } from 'artifacts/contracts/misc/MixedExecutorV2.sol/MixedExecutorV2.json';
import { abi as poolABI } from 'artifacts/contracts/core/Pool.sol/Pool.json';
import { abi as poolIndexerABI } from 'artifacts/contracts/core/PoolIndexer.sol/PoolIndexer.json';
import { CalculateMulticallResponseDto } from './chain-executor.dto';
import { packPoolIndexes, packPrices } from '../utils/packValue';
import { PriceService } from 'src/price/price.service';

enum TokenAsset {
  BTC = '0x3099c1313B7de49193773c278bb4a487FA6e42b1',
  ETH = '0xc7f646814e08697F94e7194B41824405E131f0A0',
  ORDI = '0x8fBE025c1EdF5c4a9EcF1a2ED5DaDCc49686daa6',
}

const TOKEN_INDEX_INFO = {
  [TokenAsset.BTC]: 0,
  [TokenAsset.ETH]: 2,
  [TokenAsset.ORDI]: 3,
};

@Injectable()
export class ChainExecutorService {
  private provider: ethers.providers.JsonRpcProvider;
  private executorAssistantContract: ethers.Contract;
  private executorContract: ethers.Contract;
  private poolContract: ethers.Contract;
  private poolIndexerContract: ethers.Contract;
  private signer: ethers.Signer;
  private priceService: PriceService;

  constructor(private _priceService: PriceService) {
    this.priceService = _priceService;
    this.provider = new ethers.providers.JsonRpcProvider(
      'https://arb-sepolia.g.alchemy.com/v2/RCtmHaPSrWs8prthWD31jNbk_0wEwp0j',
    );
    this.signer = new ethers.Wallet(
      '97e53b63fb1f732009434486808692aceffe2deea5ab31c649a02ffafcf2106d',
      this.provider,
    );

    this.poolContract = new ethers.Contract(
      '0x3099c1313B7de49193773c278bb4a487FA6e42b1',
      poolABI,
      this.signer,
    );

    this.poolIndexerContract = new ethers.Contract(
      '0xeF7a1CCB7f6370Bd7275e9968aaF53fcF91Ae449',
      poolIndexerABI,
      this.signer,
    );

    this.executorAssistantContract = new ethers.Contract(
      '0x93f3758e4DD91a9f0Ffc6474D6621d704a91C6d9',
      executorAssistantABI,
      this.signer,
    );

    this.executorContract = new ethers.Contract(
      '0x18e4010f21edbEfB2F13885926E4339abaB5691F',
      executorABI,
      this.signer,
    );
  }

  async getExecutorAssistantQueryResult(): Promise<void> {
    // async getExecutorAssistantQueryResult(): Promise<CalculateMulticallResponseDto> {
    // const [pools, indexPerOperations] =
    //   await this.executorAssistantContract.calculateNextMulticall(1);

    // pools.forEach((poolAddress, index) => {
    //   console.log(`Pool ${index}: ${poolAddress}`);
    // });

    // const poolsIndexes = packPoolIndexes(
    //   pools.map((pool) => TOKEN_INDEX_INFO[pool]),
    // );

    // console.log('poolsIndexes', poolsIndexes);
    const { data }: { data: Record<string, string> } =
      await this.priceService.getOraclePrice();

    const tokens = Object.keys(data);

    const priceInfo = tokens
      .map((token) => {
        const tokenAddr = TokenAsset[token];
        const tokenPrice = data[token];
        const tokenIndex = TOKEN_INDEX_INFO[tokenAddr];
        console.log('tokenAddr ', tokenAddr);
        console.log('tokenPrice ', tokenPrice);
        console.log('tokenIndex ', tokenIndex);
        return [TOKEN_INDEX_INFO[TokenAsset[token]], data[token]];
      })
      .filter((item) => typeof item[0] === 'number') as any;

    console.log('priceInfo ', priceInfo);

    const packedPrices = packPrices(priceInfo);

    // const calls = [
    //   this.executorContract.interface.encodeFunctionData(
    //     'sampleAndAdjustFundingRateBatch',
    //     [poolsIndexes],
    //   ),
    // ];

    // for (let index = 0; index < indexPerOperations.length; index++) {
    //   const indexOperation = indexPerOperations[index]?.indexEnd;

    //   console.log('indexOperation ', indexOperation);
    //   const currentCalls = [
    //     this.executorContract.interface.encodeFunctionData(
    //       'executeOpenLiquidityPositions',
    //       [indexOperation],
    //     ),
    //     this.executorContract.interface.encodeFunctionData(
    //       'executeCloseLiquidityPositions',
    //       [indexOperation],
    //     ),
    //     this.executorContract.interface.encodeFunctionData(
    //       'executeAdjustLiquidityPositionMargins',
    //       [indexOperation],
    //     ),
    //     this.executorContract.interface.encodeFunctionData(
    //       'executeIncreaseRiskBufferFundPositions',
    //       [indexOperation],
    //     ),
    //     this.executorContract.interface.encodeFunctionData(
    //       'executeDecreaseRiskBufferFundPositions',
    //       [indexOperation],
    //     ),
    //     this.executorContract.interface.encodeFunctionData(
    //       'executeIncreasePositions',
    //       [indexOperation],
    //     ),
    //     this.executorContract.interface.encodeFunctionData(
    //       'executeDecreasePositions',
    //       [indexOperation],
    //     ),
    //   ];

    //   const currentCallsResult = await this.executorContract.multicall(
    //     currentCalls,
    //   );

    //   console.log('currentCallsResult ', currentCallsResult);
    // }

    // indexPerOperations.forEach((operation, opIndex) => {
    //   console.log(`Operation ${opIndex}:`);
    //   console.log(`  - Start Index: ${operation.index}`);
    //   console.log(`  - Next Index: ${operation.indexNext}`);
    //   console.log(`  - End Index: ${operation.indexEnd}`);
    // });

    // return {
    //   pools: pools.map((pool) => pool.toString()),
    //   indexPerOperations: indexPerOperations.map((op) => ({
    //     index: op.index.toNumber(),
    //     indexNext: op.indexNext.toNumber(),
    //     indexEnd: op.indexEnd.toNumber(),
    //   })),
    // };
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

    const result = await this.executorContract.multicall(calls);

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
