// File: src/patient/medical-history.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChronicConditionDto } from '../dto/create-chronic-condition.dto';

@Injectable()
export class MedicalHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createChronicCondition(dto: CreateChronicConditionDto) {
    // Step 1: Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Step 2: Create MedicalHistoryType for chronic condition
    const medicalHistoryType = await this.prisma.medicalHistoryType.create({
      data: {
        user_id: dto.user_id,
        history_type: 'current chronic condition',
      },
    });

    // Step 3: Create ChronicConditionHistory
    const chronic = await this.prisma.chronicConditionHistory.create({
      data: {
        medical_history_type_id: medicalHistoryType.id,
        name: dto.name,
        diagnosed: new Date(dto.diagnosed),
        treating_physician: dto.treating_physician,
        last_updated: new Date(dto.last_updated),
      },
    });

    return chronic;
  }

  async getAllChronicConditions() {
  return await this.prisma.chronicConditionHistory.findMany({
    include: {
      medical_history_type: true, // if you want to include related MedicalHistoryType info
    },
  });
}

}
