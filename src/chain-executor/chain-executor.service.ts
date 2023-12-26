import { RedisService } from 'src/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { abi as executorAssistantABI } from 'artifacts/contracts/misc/ExecutorAssistant.sol/ExecutorAssistant.json';
import { abi as executorABI } from 'artifacts/contracts/misc/MixedExecutorV2.sol/MixedExecutorV2.json';
import { abi as poolABI } from 'artifacts/contracts/core/Pool.sol/Pool.json';
import { packPoolIndexes, packPrices } from '../utils/packValue';
import { PriceService } from 'src/price/price.service';

export enum TokenAsset {
  BTC = '0x9d08Fb37Be74e0542E3C2bb881158850f2f5d270',
  ETH = '0xc7f646814e08697F94e7194B41824405E131f0A0',
  ORDI = '0x774DE4eBb56Ef661133cfDc30F1ed735e6baceB5',
}

export enum TokenPool {
  BTC = '0x3099c1313B7de49193773c278bb4a487FA6e42b1',
  ETH = '0xfb7DD22Dbb9FEC2832E7c05de9AfF53D426b603B',
  ORDI = '0x774DE4eBb56Ef661133cfDc30F1ed735e6baceB5',
}

const TOKEN_INDEX_INFO = {
  [TokenPool.BTC]: 1,
  [TokenPool.ETH]: 2,
  [TokenPool.ORDI]: 3,
};

@Injectable()
export class ChainExecutorService {
  private provider: ethers.providers.JsonRpcProvider;
  private executorAssistantContract: ethers.Contract;
  private executorContract: ethers.Contract;
  private btcPoolContract: ethers.Contract;
  private ethPoolContract: ethers.Contract;
  private ordiPoolContract: ethers.Contract;
  private signer: ethers.Signer;
  private readonly logger = new Logger(ChainExecutorService.name);

  constructor(private priceService: PriceService) {
    this.provider = new ethers.providers.JsonRpcProvider(
      'https://arb-sepolia.g.alchemy.com/v2/RCtmHaPSrWs8prthWD31jNbk_0wEwp0j',
    );
    this.signer = new ethers.Wallet(
      '97e53b63fb1f732009434486808692aceffe2deea5ab31c649a02ffafcf2106d',
      this.provider,
    );

    this.btcPoolContract = new ethers.Contract(
      '0x3099c1313B7de49193773c278bb4a487FA6e42b1',
      poolABI,
      this.signer,
    );
    this.ethPoolContract = new ethers.Contract(
      '0xfb7DD22Dbb9FEC2832E7c05de9AfF53D426b603B',
      poolABI,
      this.signer,
    );
    this.ordiPoolContract = new ethers.Contract(
      '0x774DE4eBb56Ef661133cfDc30F1ed735e6baceB5',
      poolABI,
      this.signer,
    );

    // this.poolIndexerContract = new ethers.Contract(
    //   '0xeF7a1CCB7f6370Bd7275e9968aaF53fcF91Ae449',
    //   poolIndexerABI,
    //   this.signer,
    // );

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
    try {
      const [pools, indexPerOperations] =
        await this.executorAssistantContract.calculateNextMulticall(1);

      const poolIndexes = pools.map((pool) => TOKEN_INDEX_INFO[pool]);

      const packIndexes = packPoolIndexes(poolIndexes);

      for (let index = 0; index < indexPerOperations.length; index++) {
        this.logger.log(
          `indexPerOperations ${indexPerOperations} start multicall`,
        );
        const indexOperation = indexPerOperations[index]?.indexEnd;

        const markPrices = (await this.priceService.getPrices()).markPrices;
        const tokens = Object.keys(markPrices);

        const priceInfo = tokens
          .map((token) => {
            return [TOKEN_INDEX_INFO[TokenAsset[token]], markPrices[token]];
          })
          .filter((item) => typeof item[0] === 'number') as any;

        const packedPrices = packPrices(priceInfo);

        const timestamp = Math.floor(Date.now() / 1000).toString();

        const positionCalls = [
          // this.executorContract.interface.encodeFunctionData(
          //   'sampleAndAdjustFundingRateBatch',
          //   [packIndexes],
          // ),
          // this.executorContract.interface.encodeFunctionData(
          //   'executeOpenLiquidityPositions',
          //   [indexOperation],
          // ),
          // this.executorContract.interface.encodeFunctionData(
          //   'executeCloseLiquidityPositions',
          //   [indexOperation],
          // ),
          // this.executorContract.interface.encodeFunctionData(
          //   'executeAdjustLiquidityPositionMargins',
          //   [indexOperation],
          // ),
          // this.executorContract.interface.encodeFunctionData(
          //   'executeIncreaseRiskBufferFundPositions',
          //   [indexOperation],
          // ),
          // this.executorContract.interface.encodeFunctionData(
          //   'executeDecreaseRiskBufferFundPositions',
          //   [indexOperation],
          // ),
          this.executorContract.interface.encodeFunctionData(
            'executeIncreasePositions',
            [indexOperation],
          ),
          this.executorContract.interface.encodeFunctionData(
            'executeDecreasePositions',
            [indexOperation],
          ),
          this.executorContract.interface.encodeFunctionData('setPriceX96s', [
            packedPrices,
            timestamp,
          ]),
          // this.executorContract.interface.encodeFunctionData(
          //   'sampleAndAdjustFundingRateBatch',
          //   [packIndexes],
          // ),
          // this.executorContract.interface.encodeFunctionData(
          //   'collectProtocolFeeBatch',
          //   [packIndexes],
          // ),
        ];

        console.log('check positionCalls => ', positionCalls);

        await this.executorContract.multicall(positionCalls);
      }
    } catch (error) {
      this.logger.error('Error occurred in getExecutorAssistantQueryResult');
    }
  }
}
