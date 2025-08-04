import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSurgicalHistoryDto } from './dto/create-surgical-history.dto';
import { UpdateSurgicalHistoryDto } from './dto/update-surgical-history.dto';

@Injectable()
export class SurgicalHistoryService {
  constructor(private prisma: PrismaService) {}

  create(user_id: number, dto: CreateSurgicalHistoryDto) {
    return this.prisma.surgicalHistory.create({
      data: {
        user_id,
        ...dto,
        surgery_date: new Date(dto.surgery_date),
      },
    });
  }

  findByUserId(user_id: number) {
    return this.prisma.surgicalHistory.findMany({
      where: { user_id },
       orderBy: {
      created_at: 'desc', // Sort by creation time descending
    },
    });
  }

  async update(id: number, dto: UpdateSurgicalHistoryDto) {
    const existing = await this.prisma.surgicalHistory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');

    return this.prisma.surgicalHistory.update({
      where: { id },
      data: {
        ...dto,
        surgery_date: dto.surgery_date ? new Date(dto.surgery_date) : undefined,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.surgicalHistory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');

    return this.prisma.surgicalHistory.delete({ where: { id } });
  }
}
