import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Put,
} from '@nestjs/common';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { AppointmentStatus } from '@prisma/client';


@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
  ) {}

  @Post('book/:patientId/slot')
  async bookAppointment(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Body() dto: BookAppointmentDto,
  ) {
    return this.doctorAvailabilityService.bookAppointmentBySlot({
      patient_id: patientId,
      slot_id: dto.slot_id,
      doctor_id: dto.doctor_id,
      notes: dto.notes,
    });
  }

  @Get('patient/:patientId')
  async getPatientAppointments(
    @Param('patientId', ParseIntPipe) patientId: number,
  ) {
    return this.doctorAvailabilityService.getPatientAppointments(patientId);
  }

  @Get('doctor/:doctorId/available-slots')
  async getDoctorAvailableSlots(
    @Param('doctorId', ParseIntPipe) doctorId: number,
  ) {
    return this.doctorAvailabilityService.getAvailability(doctorId);
  }

  @Get('doctors/available')
  async getAvailableDoctors() {
    return this.doctorAvailabilityService.getAvailableDoctors();
  }

  @Get('doctor/:doctorId/patients/count')
async getDoctorPatientCount(
  @Param('doctorId', ParseIntPipe) doctorId: number,
) {
  return this.doctorAvailabilityService.getDoctorPatientCount(doctorId);
}

@Get('doctor/:doctorId/patients')
async getAllPatientsByDoctor(
  @Param('doctorId', ParseIntPipe) doctorId: number,
) {
  return this.doctorAvailabilityService.getAllPatientsByDoctor(doctorId);
}

@Get('today/:doctorId')
getTodaysAppointments(@Param('doctorId', ParseIntPipe) doctorId: number) {
  return this.doctorAvailabilityService.getTodaysAppointmentsByDoctor(doctorId);
}


@Put(':id/status')
async updateStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body('status') status: AppointmentStatus,
) {
  return this.doctorAvailabilityService.updateAppointmentStatus(id, status);
}



}
