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

  @Post(':doctorId')
  async createAvailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: CreateDoctorAvailabilityDto,
  ) {
    return this.doctorAvailabilityService.createAvailability({
      doctor_id: doctorId,
      ...dto,
    });
  }

  @Get(':doctorId')
  async getAvailability(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.doctorAvailabilityService.getAvailability(doctorId);
  }

  @Get(':doctorId/appointments')
  async getDoctorAppointments(
    @Param('doctorId', ParseIntPipe) doctorId: number,
  ) {
    return this.doctorAvailabilityService.getDoctorAppointments(doctorId);
  }

  // Manual trigger for testing (optional)
  @Post('admin/generate-slots')
  async generateSlots() {
    return this.slotGenerationService.generateSlotsManually();
  }
}
