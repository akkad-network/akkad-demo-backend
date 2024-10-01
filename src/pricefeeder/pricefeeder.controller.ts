import { Controller, Get, Query } from '@nestjs/common';
import { PricefeederService } from './pricefeeder.service';

@Controller('pricefeeder')
export class PricefeederController {

    constructor(private readonly pricefeederService: PricefeederService) { }

    @Get("getAllSymbol24HoursPriceChange")
    async getAllSymbol24HoursPriceChange() {
        return this.pricefeederService.fetchAllSymbol24HoursChange()
    }

    @Get('lpHourly')
    async getHourlyPrices() {
        return this.pricefeederService.getHourlyPriceRecords();
    }

    @Get('getLpPricesByInterval')
    async getLpPricesByInterval(@Query('interval') interval: '30m' | '1h' | '4h' | '1d' | '3d') {
        return this.pricefeederService.getPriceRecordsByInterval(interval);
    }

}
