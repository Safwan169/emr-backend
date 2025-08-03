import { Module } from '@nestjs/common';
import { DoctorAvailabilityController } from './doctor-availability.controller';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { AppointmentController } from './appointment.controller';

@Module({
  controllers: [DoctorAvailabilityController, AppointmentController],
  providers: [DoctorAvailabilityService],
})
export class DoctorAvailabilityModule {}
