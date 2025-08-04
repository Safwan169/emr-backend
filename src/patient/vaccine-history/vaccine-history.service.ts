import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVaccineHistoryDto } from './dto/create-vaccine-history.dto';
import { UpdateVaccineHistoryDto } from './dto/update-vaccine-history.dto';

@Injectable()
export class VaccineHistoryService {
  constructor(private prisma: PrismaService) {}

  create(user_id: number, dto: CreateVaccineHistoryDto) {
    return this.prisma.vaccineHistory.create({
      data: {
        user_id,
        ...dto,
        date: new Date(dto.date),
      },
    });
  }

  findByUserId(user_id: number) {
    return this.prisma.vaccineHistory.findMany({
      where: { user_id },
       orderBy: {
      created_at: 'desc', // Sort by creation time descending
    },
    });
  }

  async update(id: number, dto: UpdateVaccineHistoryDto) {
    const existing = await this.prisma.vaccineHistory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');

    return this.prisma.vaccineHistory.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.vaccineHistory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');

    return this.prisma.vaccineHistory.delete({ where: { id } });
  }
}
