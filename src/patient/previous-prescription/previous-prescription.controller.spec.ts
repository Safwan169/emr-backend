import { Test, TestingModule } from '@nestjs/testing';
import { PreviousPrescriptionController } from './previous-prescription.controller';

describe('PreviousPrescriptionController', () => {
  let controller: PreviousPrescriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreviousPrescriptionController],
    }).compile();

    controller = module.get<PreviousPrescriptionController>(PreviousPrescriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
