import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePreviousPrescriptionDto } from './dto/create-previous-prescription.dto';

@Injectable()
export class PreviousPrescriptionService {
  private readonly logger = new Logger(PreviousPrescriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    user_id: number,
    dto: CreatePreviousPrescriptionDto & { file_url: string },
  ) {
    this.logger.log(
      `[➕ Create Prescription] userId: ${user_id}, desc: ${dto.description || 'No desc'} 💊`,
    );
    const result = await this.prisma.previousPrescription.create({
      data: {
        user_id,
        description: dto.description || null,
        file_url: dto.file_url,
      },
    });
    this.logger.log(
      `[✅ Prescription Created] id: ${result.id} for userId: ${user_id} 🎯`,
    );
    return result;
  }

  async findAll(user_id: number) {
    this.logger.log(`[🔍 Fetch All Prescriptions] userId: ${user_id} 📋`);
    const prescriptions = await this.prisma.previousPrescription.findMany({
      where: { user_id },
      orderBy: {
        created_at: 'desc',
      },
    });
    this.logger.log(
      `[✅ Found] ${prescriptions.length} prescriptions for userId: ${user_id} 📊`,
    );
    return prescriptions;
  }

  async findOne(id: number) {
    this.logger.log(`[🔎 Find Prescription] id: ${id} 🕵️‍♂️`);
    const prescription = await this.prisma.previousPrescription.findUnique({
      where: { id },
    });
    if (!prescription) {
      this.logger.warn(`[⚠️ Prescription Not Found] id: ${id} ❌`);
      throw new NotFoundException('Prescription not found');
    }
    this.logger.log(`[✅ Prescription Found] id: ${id} 👌`);
    return prescription;
  }

  async update(
    id: number,
    data: { description?: string | null; file_url?: string },
  ) {
    this.logger.log(
      `[✏️ Update Prescription] id: ${id}, data: ${JSON.stringify(data)} 🔄`,
    );
    const exists = await this.prisma.previousPrescription.findUnique({
      where: { id },
    });
    if (!exists) {
      this.logger.warn(`[⚠️ Update Failed - Not Found] id: ${id} 😕`);
      throw new NotFoundException('Prescription not found');
    }
    const updated = await this.prisma.previousPrescription.update({
      where: { id },
      data,
    });
    this.logger.log(`[✅ Prescription Updated] id: ${id} 🎉`);
    return updated;
  }

  async remove(id: number) {
    this.logger.log(`[🗑️ Delete Prescription] id: ${id} 🧹`);
    const record = await this.prisma.previousPrescription.findUnique({
      where: { id },
    });
    if (!record) {
      this.logger.warn(`[⚠️ Delete Failed - Not Found] id: ${id} 🚫`);
      throw new NotFoundException('Prescription not found');
    }
    const deleted = await this.prisma.previousPrescription.delete({
      where: { id },
    });
    this.logger.log(`[✅ Prescription Deleted] id: ${id} 💥`);
    return deleted;
  }
}
