import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChronicConditionDto } from '../dto/create-chronic-condition.dto';
import { UpdateChronicConditionDto } from '../../patient/dto/update-chronic-condition.dto';

@Injectable()
export class MedicalHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateChronicConditionDto) {
    return await this.prisma.chronicConditionHistory.create({
      data: {
        user_id: userId,
        ...dto,
        diagnosed: new Date(dto.diagnosed),
        last_updated: new Date(dto.last_updated),
      },
    });
  }

 async findByUserId(userId: number) {
  return await this.prisma.chronicConditionHistory.findMany({
    where: { user_id: userId },
    orderBy: {
      created_at: 'desc', // Sort by creation time descending
    },
  });
}


  async update(id: number, dto: UpdateChronicConditionDto) {
    const existing = await this.prisma.chronicConditionHistory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');

    return await this.prisma.chronicConditionHistory.update({
      where: { id },
      data: {
        ...dto,
        diagnosed: dto.diagnosed ? new Date(dto.diagnosed) : undefined,
        last_updated: dto.last_updated ? new Date(dto.last_updated) : undefined,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.chronicConditionHistory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');

    return await this.prisma.chronicConditionHistory.delete({
      where: { id },
    });
  }
}
