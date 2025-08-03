import { Test, TestingModule } from '@nestjs/testing';
import { VaccineHistoryController } from './vaccine-history.controller';

describe('VaccineHistoryController', () => {
  let controller: VaccineHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VaccineHistoryController],
    }).compile();

    controller = module.get<VaccineHistoryController>(VaccineHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
