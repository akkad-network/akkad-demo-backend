import { SynchronizerService } from './synchronizer.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller('synchronizer')
export class SynchronizerController {

    constructor(private readonly synchronizerService: SynchronizerService) {

    }

    @Post("notifySyncOrderBook")
    async notifySyncOrderBook(@Body() body: any) {
        const { vault, symbol, direction } = body;
        return await this.synchronizerService.mannualSyncOrderBook(vault, symbol, direction)
    }

    @Post("notifySyncPosition")
    async notifySyncPosition(@Body() body: any) {
        const { vault, symbol, direction } = body;
        return await this.synchronizerService.mannualSyncPositionRecords(vault, symbol, direction)
    }

    @Post("notifySyncOrderAndPositionOfOwner")
    async notifySyncOrderAndPositionOfOwner(@Body() body: any) {
        const { vault, symbol, direction, owner } = body;
        return this.synchronizerService.mannualSyncOrderAndPositionOfOwner(vault, symbol, direction, owner)
    }

    @Get("getReferrerVolAndRebate")
    async getReferrerVolAndRebate(
        @Query('accountAddress') accountAddress: string
    ) {
        return await this.synchronizerService.fetchReferrerVolAndRebate(accountAddress)
    }

    @Get("getLastestLpSimulatePrice")
    async getLastestLpSimulatePrice() {
        return await this.synchronizerService.fetchLpSimulatePrice()
    }
}