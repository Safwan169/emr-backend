import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { CreateDoctorAvailabilityDto } from './dto/create-availability.dto';

@Controller('doctor-availability')
export class DoctorAvailabilityController {
  constructor(
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
  ) {}

  // Create/Update doctor availability: /doctor-availability/5
  @Post(':doctor_id')
  async createAvailability(
    @Param('doctor_id', ParseIntPipe) doctor_id: number,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    return this.doctorAvailabilityService.createAvailability({
      doctor_id,
      ...dto,
    });
  }

  // Get doctor availability: /doctor-availability/user/3/doctor/5
  @Get('user/:requesting_user_id/doctor/:doctor_id')
  async getAvailability(
    @Param('requesting_user_id', ParseIntPipe) requesting_user_id: number,
    @Param('doctor_id', ParseIntPipe) doctor_id: number,
  ) {
    return this.doctorAvailabilityService.getAvailability(
      doctor_id,
      requesting_user_id,
    );
  }

  // Get doctor appointments: /doctor-availability/user/5/doctor/5/appointments
  @Get('user/:requesting_user_id/doctor/:doctor_id/appointments')
  async getDoctorAppointments(
    @Param('requesting_user_id', ParseIntPipe) requesting_user_id: number,
    @Param('doctor_id', ParseIntPipe) doctor_id: number,
  ) {
    return this.doctorAvailabilityService.getDoctorAppointments(
      doctor_id,
      requesting_user_id,
    );
  }

  // Alternative: Public doctor availability (no user auth needed)
  @Get('public/doctor/:doctor_id')
  async getPublicAvailability(
    @Param('doctor_id', ParseIntPipe) doctor_id: number,
  ) {
    return this.doctorAvailabilityService.getAvailability(doctor_id);
  }
}
