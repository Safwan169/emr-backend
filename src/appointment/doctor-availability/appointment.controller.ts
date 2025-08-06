import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Put,
  Query,
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
      type: dto.type, // <-- Pass type
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

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.doctorAvailabilityService.updateAppointmentStatus(id, status);
  }

  @Get('Doctor/:DoctorId/AllSlots')
  async getDoctorAllSlots(@Param('DoctorId', ParseIntPipe) DoctorId: number) {
    return this.doctorAvailabilityService.getSpecificDoctorAllSlots(DoctorId);
  }

  @Get('DailyNewPatientsLast7Days/:doctorId')
  async getDailyNewPatients(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.doctorAvailabilityService.getDailyNewPatientsForLast7Days(
      doctorId,
    );
  }

  @Get('DailyAppointmentsLast7Days/:doctorId')
  async getDailyAppointmentCounts(
    @Param('doctorId', ParseIntPipe) doctorId: number,
  ) {
    return this.doctorAvailabilityService.getDailyAppointmentCountsLast7Days(
      doctorId,
    );
  }

  @Get('DoctorProfiles/Specializations')
  async getSpecializations() {
    const specializations =
      await this.doctorAvailabilityService.getUniqueSpecializations();
    return {
      success: true,
      data: specializations,
    };
  }

  @Get('Doctors/Search')
  async searchDoctors(
    @Query('name') name?: string,
    @Query('specialization') specialization?: string,
  ) {
    const doctors = await this.doctorAvailabilityService.searchDoctors({
      name,
      specialization,
    });

    return {
      success: true,
      data: doctors,
    };
  }
}
