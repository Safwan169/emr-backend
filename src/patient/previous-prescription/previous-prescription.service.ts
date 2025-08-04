import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
        user_id,
        description: dto.description || null,
        file_url: dto.file_url,
      },
    });
  }

  async findAll(user_id: number) {
    return this.prisma.previousPrescription.findMany({
      where: { user_id },
       orderBy: {
      created_at: 'desc', // Sort by creation time descending
    },
    });
  }

  async findOne(id: number) {
    const prescription = await this.prisma.previousPrescription.findUnique({
      where: { id },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async update(
    id: number,
    data: { description?: string | null; file_url?: string },
  ) {
    const exists = await this.prisma.previousPrescription.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('Prescription not found');

    return this.prisma.previousPrescription.update({
      where: { id },
      data,
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
