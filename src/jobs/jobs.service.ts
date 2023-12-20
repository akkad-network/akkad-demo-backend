import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PriceService } from 'src/price/price.service';

@Injectable()
export class JobsService {
  constructor(private priceService: PriceService) {}

  @Cron('*/15 * * * * *', {
    name: 'marketPricePositionRequests',
  })
  async handleMarketPricePositionRequests() {
    await this.priceService.getOraclePrice();
  }
}
