import { Test, TestingModule } from '@nestjs/testing';
import { PreviousPrescriptionService } from './previous-prescription.service';

describe('PreviousPrescriptionService', () => {
  let service: PreviousPrescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreviousPrescriptionService],
    }).compile();

    service = module.get<PreviousPrescriptionService>(PreviousPrescriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
