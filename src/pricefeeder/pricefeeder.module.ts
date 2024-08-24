import { Global, Module } from '@nestjs/common';
import { PricefeederService } from './pricefeeder.service';
import { PricefeederController } from './pricefeeder.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PricefeederService],
  controllers: [PricefeederController],
  exports: [PricefeederService]
})
export class PricefeederModule { }
