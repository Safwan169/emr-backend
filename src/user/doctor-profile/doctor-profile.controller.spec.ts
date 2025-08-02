import { Test, TestingModule } from '@nestjs/testing';
import { DoctorProfileController } from './doctor-profile.controller';

describe('DoctorProfileController', () => {
  let controller: DoctorProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorProfileController],
    }).compile();

    controller = module.get<DoctorProfileController>(DoctorProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
