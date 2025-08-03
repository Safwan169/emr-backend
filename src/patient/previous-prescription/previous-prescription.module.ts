import { Module } from '@nestjs/common';
import { PreviousPrescriptionController } from './previous-prescription.controller';
import { PreviousPrescriptionService } from './previous-prescription.service';

@Module({
  controllers: [PreviousPrescriptionController],
  providers: [PreviousPrescriptionService]
})
export class PreviousPrescriptionModule {}
