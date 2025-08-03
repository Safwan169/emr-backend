import { Module } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history/medical-history.service';
import { MedicalHistoryController } from './medical-history/medical-history.controller';
import { SurgicalHistoryModule } from './surgical-history/surgical-history.module';
import { VaccineHistoryModule } from './vaccine-history/vaccine-history.module';


@Module({
  providers: [MedicalHistoryService],
  controllers: [MedicalHistoryController],
  imports: [SurgicalHistoryModule, VaccineHistoryModule]
})
export class PatientModule {}
