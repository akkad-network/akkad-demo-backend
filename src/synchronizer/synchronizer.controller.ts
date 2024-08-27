import { SynchronizerService } from './synchronizer.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('synchronizer')
export class SynchronizerController {

    constructor(private readonly synchronizerService: SynchronizerService) {

    }

    @Post("notifySyncOrderBook")
    async notifySyncOrderBook(@Body() body: any) {
        const { vault, symbol, direction } = body;
        return this.synchronizerService.mannualSyncOrderBook(vault, symbol, direction)
    }

    @Post("notifySyncPosition")
    async notifySyncPosition(@Body() body: any) {
        const { vault, symbol, direction } = body;
        return this.synchronizerService.mannualSyncPositionRecords(vault, symbol, direction)
    }
}
