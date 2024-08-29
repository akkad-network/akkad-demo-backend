import { Controller, Get } from '@nestjs/common';
import { PricefeederService } from './pricefeeder.service';

@Controller('pricefeeder')
export class PricefeederController {

    constructor(private readonly pricefeederService: PricefeederService) { }

    @Get("getAllSymbol24HoursPriceChange")
    async getAllSymbol24HoursPriceChange() {
        return this.pricefeederService.fetchAllSymbol24HoursChange()
    }
}
