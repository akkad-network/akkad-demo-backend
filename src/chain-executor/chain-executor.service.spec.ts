import { Test, TestingModule } from '@nestjs/testing';
import { ChainExecutorService } from './chain-executor.service';

describe('ChainExecutorService', () => {
  let service: ChainExecutorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChainExecutorService],
    }).compile();

    service = module.get<ChainExecutorService>(ChainExecutorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
