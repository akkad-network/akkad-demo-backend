/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  constructor(
    private httpService: HttpService,
    private redisService: RedisService,
  ) { }

  async getMarkedPrice(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3001/price/getMarkedPrice'),
    );
    return response.data;
  }

  async getOraclePrice(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3001/price/getOraclePrice'),
    );
    return response.data;
  }

  async getPrices() {
    const redisClient = await this.redisService.getClient();
    const indexPrices = JSON.parse(await redisClient.get('indexPrices'));
    const markPrices = JSON.parse(await redisClient.get('markPrices'));

    return {
      indexPrices,
      markPrices,
    };
  }

  async setPrices(): Promise<void> {
    const redisClient = await this.redisService.getClient();
    const indexPrices = (await this.getMarkedPrice()) as Record<string, any>;
    const markPrices = (await this.getMarkedPrice()) as Record<string, any>;
    await redisClient.set('indexPrices', JSON.stringify(indexPrices));
    await redisClient.set('markPrices', JSON.stringify(markPrices));
  }
}
