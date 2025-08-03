import { Test, TestingModule } from '@nestjs/testing';
import { DoctorProfileService } from './doctor-profile.service';

describe('DoctorProfileService', () => {
  let service: DoctorProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorProfileService],
    }).compile();

    service = module.get<DoctorProfileService>(DoctorProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
