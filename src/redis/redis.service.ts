import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
  }

  // 示例方法
  async get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async getClient(): Promise<Redis> {
    return this.redisClient;
  }
}
