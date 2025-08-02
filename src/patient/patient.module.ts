import { Module } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history/medical-history.service';
import { MedicalHistoryController } from './medical-history/medical-history.controller';

@Module({
  providers: [MedicalHistoryService],
  controllers: [MedicalHistoryController]
})
export class PatientModule {}
