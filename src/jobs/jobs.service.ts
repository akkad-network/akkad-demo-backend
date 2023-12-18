import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class JobsService {
  constructor(private contractService: JobsService) {}

  @Cron('0 * * * * *')
  async handleCron() {
    // 调用 contractService 中的方法来执行智能合约交易
    // await this.contractService.executeJobs();
  }
}
