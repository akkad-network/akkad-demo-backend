import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PriceService {
  constructor(
    private httpService: HttpService,
    private redisService: RedisService,
  ) {}

  async getMarkedPrice(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3000/price/getMarkedPrice'),
    );
    return response.data;
  }

  async getOraclePrice(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3000/price/getOraclePrice'),
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
    const indexPrices = (await this.getMarkedPrice()) as Record<string, string>;
    const markPrices = (await this.getMarkedPrice()) as Record<string, string>;
    await redisClient.set('indexPrices', JSON.stringify(indexPrices));
    await redisClient.set('markPrices', JSON.stringify(markPrices));
  }
}
