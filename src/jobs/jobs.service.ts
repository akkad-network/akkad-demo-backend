import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChainExecutorService } from 'src/chain-executor/chain-executor.service';
import { PriceService } from 'src/price/price.service';

@Injectable()
export class JobsService {
  constructor(
    private priceService: PriceService,
    private chainExecutorService: ChainExecutorService,
  ) {}

  @Cron('0 * * * * *', {
    name: 'executor',
  })
  async handleExecutor() {
    await this.priceService.getOraclePrice();
    await this.chainExecutorService.getExecutorAssistantQueryResult();
  }

  @Cron('*/15 * * * * *', {
    name: 'marketPricePositionRequests',
  })
  async handleMarketPricePositionRequests() {
    await this.priceService.setPrices();
  }
}
