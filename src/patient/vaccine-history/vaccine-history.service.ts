import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVaccineHistoryDto } from './dto/create-vaccine-history.dto';
import { UpdateVaccineHistoryDto } from './dto/update-vaccine-history.dto';

@Injectable()
export class VaccineHistoryService {
  private readonly logger = new Logger(VaccineHistoryService.name);

  constructor(private prisma: PrismaService) {}

  create(user_id: number, dto: CreateVaccineHistoryDto) {
    this.logger.log(
      `[💉 Create Vaccine] userId: ${user_id}, vaccine: ${dto.vaccine_name} 🦠`,
    );
    const result = this.prisma.vaccineHistory.create({
      data: {
        user_id,
        ...dto,
        date: new Date(dto.date),
      },
    });
    this.logger.log(`[✅ Vaccine Created] userId: ${user_id} 🎉`);
    return result;
  }

  findByUserId(user_id: number) {
    this.logger.log(`[🔍 Fetch Vaccines] userId: ${user_id} 📋`);
    return this.prisma.vaccineHistory
      .findMany({
        where: { user_id },
        orderBy: {
          created_at: 'desc',
        },
      })
      .then((results) => {
        this.logger.log(
          `[✅ Vaccines Found] count: ${results.length} for userId: ${user_id} 🔥`,
        );
        return results;
      });
  }

  async update(id: number, dto: UpdateVaccineHistoryDto) {
    this.logger.log(
      `[✏️ Update Vaccine] id: ${id}, data: ${JSON.stringify(dto)} 🔄`,
    );
    const existing = await this.prisma.vaccineHistory.findUnique({
      where: { id },
    });
    if (!existing) {
      this.logger.warn(`[⚠️ Vaccine Update Failed - Not Found] id: ${id} 😕`);
      throw new NotFoundException('Record not found');
    }
    const updated = await this.prisma.vaccineHistory.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
    this.logger.log(`[✅ Vaccine Updated] id: ${id} 💫`);
    return updated;
  }

  async remove(id: number) {
    this.logger.log(`[🗑️ Delete Vaccine] id: ${id} 💥`);
    const existing = await this.prisma.vaccineHistory.findUnique({
      where: { id },
    });
    if (!existing) {
      this.logger.warn(`[⚠️ Vaccine Delete Failed - Not Found] id: ${id} 🚫`);
      throw new NotFoundException('Record not found');
    }
    const deleted = await this.prisma.vaccineHistory.delete({ where: { id } });
    this.logger.log(`[✅ Vaccine Deleted] id: ${id} 🔥`);
    return deleted;
  }
}
