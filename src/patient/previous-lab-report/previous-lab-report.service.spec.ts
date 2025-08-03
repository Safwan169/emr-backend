import { Test, TestingModule } from '@nestjs/testing';
import { PreviousLabReportService } from './previous-lab-report.service';

describe('PreviousLabReportService', () => {
  let service: PreviousLabReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreviousLabReportService],
    }).compile();

    service = module.get<PreviousLabReportService>(PreviousLabReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
