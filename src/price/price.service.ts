/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  constructor(
    private httpService: HttpService,
    private redisService: RedisService,
    private prisma: PrismaService,
  ) { }


}