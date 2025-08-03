import { Test, TestingModule } from '@nestjs/testing';
import { SurgicalHistoryController } from './surgical-history.controller';

describe('SurgicalHistoryController', () => {
  let controller: SurgicalHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurgicalHistoryController],
    }).compile();

    controller = module.get<SurgicalHistoryController>(SurgicalHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
