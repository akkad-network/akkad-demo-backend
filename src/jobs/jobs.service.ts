/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChainExecutorService } from 'src/chain-executor/chain-executor.service';
import { PriceService } from 'src/price/price.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private counter = 0;

  constructor(
    private priceService: PriceService,
    private chainExecutorService: ChainExecutorService,
  ) { }

  // @Cron('*/20 * * * * *', {
  //   name: 'executor',
  // })
  // async handleExecutor() {
  //   this.counter = ++this.counter;
  //   this.logger.log(`Execute executor call: ${this.counter} time`);
  //   await this.priceService.getOraclePrice();
  //   await this.chainExecutorService.getExecutorAssistantQueryResult();
  // }

  // @Cron('*/20 * * * * *', {
  //   name: 'marketPricePositionRequests',
  // })
  // async handleMarketPricePositionRequests() {
  //   await this.priceService.setPrices();
  // }

  // @Cron('*/20 * * * * *', {
  //   name: 'saveMarkedPrice',
  // })
  // async handleSaveMarkedPrice() {
  //   this.logger.log('Fetching and saving marked price...');
  //   await this.priceService.saveMarkedPrice();
  // }
}
