import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChronicConditionDto } from '../dto/create-chronic-condition.dto';
import { UpdateChronicConditionDto } from '../../patient/dto/update-chronic-condition.dto';

@Injectable()
export class MedicalHistoryService {
  private readonly logger = new Logger(MedicalHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateChronicConditionDto) {
    this.logger.log(
      `[➕ Create Chronic Condition] userId: ${userId}, data: ${JSON.stringify(dto)} 🩺`,
    );
    const result = await this.prisma.chronicConditionHistory.create({
      data: {
        user_id: userId,
        ...dto,
        diagnosed: new Date(dto.diagnosed),
        last_updated: new Date(dto.last_updated),
      },
    });
    this.logger.log(
      `[✅ Created] Chronic Condition ID: ${result.id} for userId: ${userId} 🎉`,
    );
    return result;
  }

  async findByUserId(userId: number) {
    this.logger.log(`[🔍 Find Chronic Conditions] for userId: ${userId} 🕵️‍♂️`);
    const records = await this.prisma.chronicConditionHistory.findMany({
      where: { user_id: userId },
      orderBy: {
        created_at: 'desc',
      },
    });
    this.logger.log(
      `[✅ Found] ${records.length} records for userId: ${userId} 📚`,
    );
    return records;
  }

  async update(id: number, dto: UpdateChronicConditionDto) {
    this.logger.log(
      `[✏️ Update Chronic Condition] id: ${id}, data: ${JSON.stringify(dto)} 🔄`,
    );
    const existing = await this.prisma.chronicConditionHistory.findUnique({
      where: { id },
    });
    if (!existing) {
      this.logger.warn(`[⚠️ Update Failed] No record found with id: ${id} ❌`);
      throw new NotFoundException('Record not found');
    }
    const updated = await this.prisma.chronicConditionHistory.update({
      where: { id },
      data: {
        ...dto,
        diagnosed: dto.diagnosed ? new Date(dto.diagnosed) : undefined,
        last_updated: dto.last_updated ? new Date(dto.last_updated) : undefined,
      },
    });
    this.logger.log(`[✅ Updated] Chronic Condition ID: ${id} successfully ✨`);
    return updated;
  }

  async remove(id: number) {
    this.logger.log(`[🗑️ Remove Chronic Condition] id: ${id} ❌`);
    const existing = await this.prisma.chronicConditionHistory.findUnique({
      where: { id },
    });
    if (!existing) {
      this.logger.warn(`[⚠️ Remove Failed] No record found with id: ${id} 🤷‍♂️`);
      throw new NotFoundException('Record not found');
    }
    const deleted = await this.prisma.chronicConditionHistory.delete({
      where: { id },
    });
    this.logger.log(`[✅ Removed] Chronic Condition ID: ${id} successfully 🧹`);
    return deleted;
  }
}
