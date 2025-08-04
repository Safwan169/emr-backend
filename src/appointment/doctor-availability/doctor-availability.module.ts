import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DoctorAvailabilityController } from './doctor-availability.controller';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { AppointmentController } from './appointment.controller';
import { SlotGenerationService } from './slot-generation.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [DoctorAvailabilityController, AppointmentController],
  providers: [DoctorAvailabilityService, SlotGenerationService],
  exports: [DoctorAvailabilityService, SlotGenerationService],
})
export class DoctorAvailabilityModule {}
