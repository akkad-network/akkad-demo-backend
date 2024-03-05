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

  async saveMarkedPrice(): Promise<void> {
    const data = await this.getMarkedPrice();
    if (data && data.success) {
      for (const symbol of Object.keys(data.data)) {
        const tokenData = data.data[symbol];
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000); // Unix timestamp in seconds
        const roundedTimestamp = timestamp - (timestamp % 60); // Round down to the nearest minute

        // Check if there's an existing record for this symbol and minute
        const record = await this.prisma.kline_data.findFirst({
          where: {
            symbol: symbol,
            timestamp: roundedTimestamp,
          },
        });

        if (record) {
          // Update existing record
          await this.prisma.kline_data.update({
            where: { id: record.id },
            data: {
              close: new Decimal(tokenData.markPrice),
              high: new Decimal(tokenData.markPrice).greaterThan(record.high) ? new Decimal(tokenData.markPrice) : record.high,
              low: new Decimal(tokenData.markPrice).lessThan(record.low) ? new Decimal(tokenData.markPrice) : record.low,
            },
          });
        } else {
          // Create a new record
          await this.prisma.kline_data.create({
            data: {
              symbol: symbol,
              open: new Decimal(tokenData.markPrice),
              close: new Decimal(tokenData.markPrice),
              high: new Decimal(tokenData.markPrice),
              low: new Decimal(tokenData.markPrice),
              timestamp: roundedTimestamp,
            },
          });
        }
      }
    }
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

  async getKlineDataService(symbol: string, type: number): Promise<any> {
    const now = new Date();
    const startTimestamp = Math.floor(now.getTime() / 1000) - type * 60; // Current time - type minutes in seconds

    // Query aggregated Kline data for the given symbol within the specified timeframe
    const aggregatedData = await this.prisma.$queryRaw`
      SELECT 
        FLOOR(timestamp / (${type} * 60)) as period,
        MAX(high) as high,
        MIN(low) as low,
        (SELECT open FROM kline_data WHERE symbol = ${symbol} AND FLOOR(timestamp / (${type} * 60)) = period ORDER BY timestamp ASC LIMIT 1) as open,
        (SELECT close FROM kline_data WHERE symbol = ${symbol} AND FLOOR(timestamp / (${type} * 60)) = period ORDER BY timestamp DESC LIMIT 1) as close
      FROM kline_data
      WHERE symbol = ${symbol}
      GROUP BY period
      ORDER BY period ASC
    `;

    const tempArray = Array.isArray(aggregatedData) ? aggregatedData : []
    const dataWithConvertedBigInt = tempArray.map(item => ({
      ...item,
      period: item.period.toString(),
    }));

    return { data: dataWithConvertedBigInt, status: 'success' };
  }
}
