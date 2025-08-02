import { Test, TestingModule } from '@nestjs/testing';
import { SurgicalHistoryService } from './surgical-history.service';

describe('SurgicalHistoryService', () => {
  let service: SurgicalHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurgicalHistoryService],
    }).compile();

    service = module.get<SurgicalHistoryService>(SurgicalHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
