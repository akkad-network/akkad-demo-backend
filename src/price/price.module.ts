import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { HttpModule } from '@nestjs/axios';
import { PriceController } from './price.controller';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [HttpModule, RedisModule, PrismaModule],
  providers: [PriceService],
  exports: [PriceService],
  controllers: [PriceController],
})
// eslint-disable-next-line prettier/prettier
export class PriceModule { }
