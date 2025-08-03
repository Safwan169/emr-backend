import { Test, TestingModule } from '@nestjs/testing';
import { VaccineHistoryService } from './vaccine-history.service';

describe('VaccineHistoryService', () => {
  let service: VaccineHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VaccineHistoryService],
    }).compile();

    service = module.get<VaccineHistoryService>(VaccineHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
