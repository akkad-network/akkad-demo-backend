import { Test, TestingModule } from '@nestjs/testing';
import { ChainExecutorController } from './chain-executor.controller';

describe('ChainExecutorController', () => {
  let controller: ChainExecutorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainExecutorController],
    }).compile();

    controller = module.get<ChainExecutorController>(ChainExecutorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
