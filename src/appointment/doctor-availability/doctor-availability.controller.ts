import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { SlotGenerationService } from './slot-generation.service';
import { CreateDoctorAvailabilityDto } from './dto/create-availability.dto';

@Controller('DoctorAvailability')
export class DoctorAvailabilityController {
  constructor(
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
    private readonly slotGenerationService: SlotGenerationService,
  ) {}

  @Post(':DoctorId')
  async createAvailability(
    @Param('DoctorId', ParseIntPipe) DoctorId: number,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    return this.doctorAvailabilityService.createAvailability({
      doctor_id: DoctorId,
      ...dto,
    });
  }

  @Get(':DoctorId')
  async getAvailability(@Param('DoctorId', ParseIntPipe) DoctorId: number) {
    return this.doctorAvailabilityService.getAvailability(DoctorId);
  }

  @Get(':DoctorId/Appointments')
  async getDoctorAppointments(
    @Param('DoctorId', ParseIntPipe) DoctorId: number,
  ) {
    return this.doctorAvailabilityService.getDoctorAppointments(DoctorId);
  }

  //! Manual trigger for testing (optional)
  @Post('Admin/GenerateSlots')
  async generateSlots() {
    return this.slotGenerationService.generateSlotsManually();
  }
}
