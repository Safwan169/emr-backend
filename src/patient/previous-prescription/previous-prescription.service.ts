// previous-prescription.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Your PrismaService import path
import { CreatePreviousPrescriptionDto } from './dto/create-previous-prescription.dto';

@Injectable()
export class PreviousPrescriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user_id: number,
    dto: CreatePreviousPrescriptionDto & { file_url: string },
  ) {
    return this.prisma.previousPrescription.create({
      data: {
        user_id,               // match exactly your prisma model
        description: dto.description || null,
        file_url: dto.file_url,
      },
    });
  }

  async findAll(user_id: number) {
    return this.prisma.previousPrescription.findMany({
      where: { user_id },  // exact field name
    });
  }

  async remove(id: number) {
    const record = await this.prisma.previousPrescription.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException('Prescription not found');
    return this.prisma.previousPrescription.delete({ where: { id } });
  }
}
