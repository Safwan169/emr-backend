import { Test, TestingModule } from '@nestjs/testing';
import { PreviousLabReportController } from './previous-lab-report.controller';

describe('PreviousLabReportController', () => {
  let controller: PreviousLabReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreviousLabReportController],
    }).compile();

    controller = module.get<PreviousLabReportController>(PreviousLabReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
