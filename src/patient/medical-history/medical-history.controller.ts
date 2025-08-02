// File: src/patient/medical-history.controller.ts

import { Controller, Post,Get , Body, HttpException, HttpStatus } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateChronicConditionDto } from '../dto/create-chronic-condition.dto';

@Controller('Patient/Medical-History')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Post('Chronic')
  async createChronicCondition(@Body() dto: CreateChronicConditionDto) {
    try {
      const chronic = await this.medicalHistoryService.createChronicCondition(dto);
      return {
        message: 'Chronic condition history created successfully',
        data: chronic,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create chronic condition history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

   @Get('Chronic')
  async getAllChronicConditions() {
    return this.medicalHistoryService.getAllChronicConditions();
  }

}
