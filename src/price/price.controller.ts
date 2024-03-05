import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('price')
export class PriceController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly priceService: PriceService) { }

  @Get('prices')
  async addressBalance() {
    return await this.priceService.getPrices();
  }

  @Get('klineData')
  async getKlineData(
    @Query('symbol') symbol: string,
    @Query('type') type: string,
  ) {
    const typeNumber = parseInt(type, 10);
    if (isNaN(typeNumber)) {
      return 'Invalid type value';
    }
    return await this.priceService.getKlineDataService(symbol, typeNumber);
  }
}
