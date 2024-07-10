import { Controller, Post } from '@nestjs/common';
import { ScannerService } from './scanner.service';

@Controller('scanner')
export class ScannerController {
    constructor(private readonly scannerService: ScannerService) { }

    @Post('manual-sync')
    async manualSync() {
        await this.scannerService.manualSync();
        return { message: 'Manual sync initiated' };
    }
}