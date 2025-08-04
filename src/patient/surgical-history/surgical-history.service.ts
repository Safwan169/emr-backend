import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSurgicalHistoryDto } from './dto/create-surgical-history.dto';
import { UpdateSurgicalHistoryDto } from './dto/update-surgical-history.dto';

@Injectable()
export class SurgicalHistoryService {
  private readonly logger = new Logger(SurgicalHistoryService.name);

  constructor(private prisma: PrismaService) {}

  create(user_id: number, dto: CreateSurgicalHistoryDto) {
    this.logger.log(`[➕ Create Surgery] userId: ${user_id}🏥`);
    const result = this.prisma.surgicalHistory.create({
      data: {
        user_id,
        ...dto,
        surgery_date: new Date(dto.surgery_date),
      },
    });
    this.logger.log(`[✅ Surgery Created] userId: ${user_id} 🆗`);
    return result;
  }

  findByUserId(user_id: number) {
    this.logger.log(`[🔍 Find Surgeries] userId: ${user_id} 🩺`);
    return this.prisma.surgicalHistory
      .findMany({
        where: { user_id },
        orderBy: {
          created_at: 'desc',
        },
      })
      .then((results) => {
        this.logger.log(
          `[✅ Found Surgeries] count: ${results.length} for userId: ${user_id} 📋`,
        );
        return results;
      });
  }

  async update(id: number, dto: UpdateSurgicalHistoryDto) {
    this.logger.log(
      `[✏️ Update Surgery] id: ${id}, data: ${JSON.stringify(dto)} 🔄`,
    );
    const existing = await this.prisma.surgicalHistory.findUnique({
      where: { id },
    });
    if (!existing) {
      this.logger.warn(`[⚠️ Surgery Update Failed - Not Found] id: ${id} 😕`);
      throw new NotFoundException('Record not found');
    }
    const updated = await this.prisma.surgicalHistory.update({
      where: { id },
      data: {
        ...dto,
        surgery_date: dto.surgery_date ? new Date(dto.surgery_date) : undefined,
      },
    });
    this.logger.log(`[✅ Surgery Updated] id: ${id} 🎉`);
    return updated;
  }

  async remove(id: number) {
    this.logger.log(`[🗑️ Delete Surgery] id: ${id} 🧹`);
    const existing = await this.prisma.surgicalHistory.findUnique({
      where: { id },
    });
    if (!existing) {
      this.logger.warn(`[⚠️ Surgery Delete Failed - Not Found] id: ${id} 🚫`);
      throw new NotFoundException('Record not found');
    }
    const deleted = await this.prisma.surgicalHistory.delete({ where: { id } });
    this.logger.log(`[✅ Surgery Deleted] id: ${id} 💥`);
    return deleted;
  }
}
