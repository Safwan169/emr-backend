import { Module } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history/medical-history.service';
import { MedicalHistoryController } from './medical-history/medical-history.controller';
import { SurgicalHistoryModule } from './surgical-history/surgical-history.module';
import { VaccineHistoryModule } from './vaccine-history/vaccine-history.module';
import { PreviousPrescriptionModule } from './previous-prescription/previous-prescription.module';
import { PreviousLabReportModule } from './previous-lab-report/previous-lab-report.module';
import { AllergyModule } from './allergy/allergy.module';


@Module({
  providers: [MedicalHistoryService],
  controllers: [MedicalHistoryController],
  imports: [SurgicalHistoryModule, VaccineHistoryModule, PreviousPrescriptionModule, PreviousLabReportModule, AllergyModule]
})
export class PatientModule {}
