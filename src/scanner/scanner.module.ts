import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';
import { ExecutorModule } from 'src/executor/executor.module';
import { LiquidatorModule } from 'src/liquidator/liquidator.module';

@Module({
    imports: [ExecutorModule, LiquidatorModule],
    controllers: [ScannerController],
    providers: [ScannerService],
    exports: [ScannerService]
})
export class ScannerModule { }