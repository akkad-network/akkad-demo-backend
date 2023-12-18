import { Controller, Get, Param } from '@nestjs/common';
import { ChainExecutorService } from './chain-executor.service';

@Controller('chain-executor')
export class ChainExecutorController {
  constructor(private readonly chainExecutorService: ChainExecutorService) {}

  @Get('getAssistant')
  async addressBalance(): Promise<any> {
    return await this.chainExecutorService.getExecutorAssistantQueryResult();
  }
}
