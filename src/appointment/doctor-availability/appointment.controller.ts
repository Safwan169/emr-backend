import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Patch,
} from '@nestjs/common';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
  ) {}

  // Book appointment: /appointments/user/3/book-for-patient/3
  @Post('user/:requesting_user_id/book-for-patient/:patient_id')
  async bookAppointment(
    @Param('requesting_user_id', ParseIntPipe) requesting_user_id: number,
    @Param('patient_id', ParseIntPipe) patient_id: number,
    @Body() dto: BookAppointmentDto,
  ) {
    return this.doctorAvailabilityService.bookAppointment({
      patient_id,
      slot_id: dto.slot_id,
      notes: dto.notes,
    });
  }

  // Get patient appointments: /appointments/user/3/patient/3
  @Get('user/:requesting_user_id/patient/:patient_id')
  async getPatientAppointments(
    @Param('requesting_user_id', ParseIntPipe) requesting_user_id: number,
    @Param('patient_id', ParseIntPipe) patient_id: number,
  ) {
    return this.doctorAvailabilityService.getPatientAppointments(
      patient_id,
      requesting_user_id,
    );
  }

  // Update appointment status: /appointments/user/3/appointment/123/status
  @Patch('user/:requesting_user_id/appointment/:appointment_id/status')
  async updateAppointmentStatus(
    @Param('requesting_user_id', ParseIntPipe) requesting_user_id: number,
    @Param('appointment_id', ParseIntPipe) appointment_id: number,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.doctorAvailabilityService.updateAppointmentStatus(
      appointment_id,
      dto.status,
      requesting_user_id,
    );
  }

  @Post('auto-cancel-missed')
  async autoCancelMissedAppointments() {
    return this.doctorAvailabilityService.autoCancelMissedAppointments();
  }
}
