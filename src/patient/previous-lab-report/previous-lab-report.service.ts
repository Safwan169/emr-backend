import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePreviousLabReportDto } from './dto/create-previous-lab-report.dto';

@Injectable()
export class PreviousLabReportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user_id: number,
    dto: CreatePreviousLabReportDto & { file_url: string },
  ) {
    return this.prisma.previousLabReport.create({
      data: {
        user_id,
        description: dto.description || null,
        file_url: dto.file_url,
      },
    });
  }

  async findAll(user_id: number) {
    return this.prisma.previousLabReport.findMany({
      where: { user_id },
       orderBy: {
      created_at: 'desc', // Sort by creation time descending
    },
    });
  }

  async findOne(id: number) {
    const report = await this.prisma.previousLabReport.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException('Lab Report not found');
    return report;
  }

  async update(
    id: number,
    data: { description?: string | null; file_url?: string },
  ) {
    const report = await this.prisma.previousLabReport.findUnique({
      where: { id },
    });
    if (!report) throw new NotFoundException('Lab Report not found');

    return this.prisma.previousLabReport.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const record = await this.prisma.previousLabReport.findUnique({
      where: { id },
    });
    if (!record) throw new NotFoundException('Lab Report not found');
    return this.prisma.previousLabReport.delete({ where: { id } });
  }
}
