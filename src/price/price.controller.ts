import { Controller, Get } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('prices')
  async addressBalance() {
    return await this.priceService.getPrices();
  }
}
