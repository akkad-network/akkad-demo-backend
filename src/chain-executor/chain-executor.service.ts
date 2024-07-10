import { RedisService } from 'src/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { packPoolIndexes, packPrices, toPriceX96 } from '../utils/packValue';
import { PriceService } from 'src/price/price.service';

import { marketABI } from 'artifacts/v2ABI/marketABI';
import { executorAssisABI } from 'artifacts/v2ABI/executorAssisABI';
import { mixedExecutorABI } from 'artifacts/v2ABI/mixedExecutorABI';
export enum TokenAsset {
  ETH = '0x07ad9146a879361330C46611b642F0e3BFeB7492',
  BTC = '0x45f966fecf6A91155f97c22116D5d4B57Bb7c0a9',
  ARB = '0x401A3cE493cfB0C4D9B6dA2ba8bCbe92FCCF7079',
  LINK = '0x5Dd24e226AD3d78F70071466015b3e1f3E85C37F',
}

export enum TokenPool {
  ETH = '0x07ad9146a879361330C46611b642F0e3BFeB7492',
  BTC = '0x45f966fecf6A91155f97c22116D5d4B57Bb7c0a9',
  ARB = '0x401A3cE493cfB0C4D9B6dA2ba8bCbe92FCCF7079',
  LINK = '0x5Dd24e226AD3d78F70071466015b3e1f3E85C37F',
}

const TOKEN_INDEX_INFO = {
  [TokenPool.ETH]: 1,
  [TokenPool.BTC]: 2,
  [TokenPool.ARB]: 3,
  [TokenPool.LINK]: 4,
};

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ChainExecutorService {
  private provider: ethers.providers.JsonRpcProvider;
  private executorAssistantContract: ethers.Contract;
  private executorContract: ethers.Contract;

  private ethMarket: ethers.Contract;
  private btcMarket: ethers.Contract;
  private arbMarket: ethers.Contract;
  private linkMarket: ethers.Contract;
  private signer: ethers.Signer;
  private readonly logger = new Logger(ChainExecutorService.name);

  constructor(private priceService: PriceService) {
    const rpc_url =
      'https://arb-sepolia.g.alchemy.com/v2/RCtmHaPSrWs8prthWD31jNbk_0wEwp0j';

    const singer_pk =
      '97e53b63fb1f732009434486808692aceffe2deea5ab31c649a02ffafcf2106d';

    const ethMarketAddress = '0x07ad9146a879361330C46611b642F0e3BFeB7492';
    const btcMarketAddress = '0x45f966fecf6A91155f97c22116D5d4B57Bb7c0a9';
    const arbMarketAddress = '0x401A3cE493cfB0C4D9B6dA2ba8bCbe92FCCF7079';
    const linkMarketAddress = '0x5Dd24e226AD3d78F70071466015b3e1f3E85C37F';
    const executorAssisAddress = '0x80B50708F8818Ea0e5968305b165676A8c252904';
    const executorAddress = '0x6bBdFc629D0337593e5d32cC56104D35f13ac72E';
    this.provider = new ethers.providers.JsonRpcProvider(rpc_url);
    this.signer = new ethers.Wallet(singer_pk, this.provider);

    this.ethMarket = new ethers.Contract(
      ethMarketAddress,
      marketABI,
      this.signer,
    );

    this.btcMarket = new ethers.Contract(
      btcMarketAddress,
      marketABI,
      this.signer,
    );

    this.arbMarket = new ethers.Contract(
      arbMarketAddress,
      marketABI,
      this.signer,
    );

    this.linkMarket = new ethers.Contract(
      linkMarketAddress,
      marketABI,
      this.signer,
    );

    this.executorAssistantContract = new ethers.Contract(
      executorAssisAddress,
      executorAssisABI,
      this.signer,
    );

    this.executorContract = new ethers.Contract(
      executorAddress,
      mixedExecutorABI,
      this.signer,
    );

    // this.poolIndexerContract = new ethers.Contract(
    //   '0xeF7a1CCB7f6370Bd7275e9968aaF53fcF91Ae449',
    //   poolIndexerABI,
    //   this.signer,
    // );
  }
}