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

@Controller('Appointments')
export class AppointmentController {
  constructor(
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
  ) {}

  @Post('Book/:PatientId/Slot')
  async bookAppointment(
    @Param('PatientId', ParseIntPipe) PatientId: number,
    @Body() dto: BookAppointmentDto,
  ) {
    return this.doctorAvailabilityService.bookAppointmentBySlot({
      patient_id: PatientId,
      slot_id: dto.slot_id,
      doctor_id: dto.doctor_id,
      notes: dto.notes,
    });
  }

  @Get('Patient/:PatientId')
  async getPatientAppointments(
    @Param('PatientId', ParseIntPipe) PatientId: number,
  ) {
    return this.doctorAvailabilityService.getPatientAppointments(PatientId);
  }

  @Get('Doctor/:DoctorId/AvailableSlots')
  async getDoctorAvailableSlots(
    @Param('DoctorId', ParseIntPipe) DoctorId: number,
  ) {
    return this.doctorAvailabilityService.getAvailability(DoctorId);
  }

  @Get('Doctors/Available')
  async getAvailableDoctors() {
    return this.doctorAvailabilityService.getAvailableDoctors();
  }

  @Get('Doctor/:DoctorId/Patients/Count')
  async getDoctorPatientCount(
    @Param('DoctorId', ParseIntPipe) DoctorId: number,
  ) {
    return this.doctorAvailabilityService.getDoctorPatientCount(DoctorId);
  }

  @Get('Doctor/:DoctorId/Patients')
  async getAllPatientsByDoctor(
    @Param('DoctorId', ParseIntPipe) DoctorId: number,
  ) {
    return this.doctorAvailabilityService.getAllPatientsByDoctor(DoctorId);
  }

  @Get('Today/:DoctorId')
  getTodaysAppointments(@Param('DoctorId', ParseIntPipe) DoctorId: number) {
    return this.doctorAvailabilityService.getTodaysAppointmentsByDoctor(
      DoctorId,
    );
  }

  @Put(':Id/Status')
  async updateStatus(
    @Param('Id', ParseIntPipe) Id: number,
    @Body('Status') Status: AppointmentStatus,
  ) {
    return this.doctorAvailabilityService.updateAppointmentStatus(Id, Status);
  }

  @Get('Doctor/:DoctorId/AllSlots')
  async getDoctorAllSlots(@Param('DoctorId', ParseIntPipe) DoctorId: number) {
    return this.doctorAvailabilityService.getSpecificDoctorAllSlots(DoctorId);
  }
}
