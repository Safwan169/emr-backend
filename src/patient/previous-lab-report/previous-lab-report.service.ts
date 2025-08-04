import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePreviousLabReportDto } from './dto/create-previous-lab-report.dto';

@Injectable()
export class PreviousLabReportService {
  private readonly logger = new Logger(PreviousLabReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    user_id: number,
    dto: CreatePreviousLabReportDto & { file_url: string },
  ) {
    this.logger.log(
      `[➕ Create Lab Report] userId: ${user_id}, description: ${dto.description || 'No desc'} 📄`,
    );
    const result = await this.prisma.previousLabReport.create({
      data: {
        user_id,
        description: dto.description || null,
        file_url: dto.file_url,
      },
    });
    this.logger.log(
      `[✅ Created Lab Report] id: ${result.id} for userId: ${user_id} 🎯`,
    );
    return result;
  }

  async findAll(user_id: number) {
    this.logger.log(`[🔍 Fetch All Lab Reports] for userId: ${user_id} 🧪`);
    const reports = await this.prisma.previousLabReport.findMany({
      where: { user_id },
      orderBy: {
        created_at: 'desc',
      },
    });
    this.logger.log(
      `[✅ Found] ${reports.length} lab reports for userId: ${user_id} 📊`,
    );
    return reports;
  }

  async findOne(id: number) {
    this.logger.log(`[🔎 Find Lab Report] id: ${id} 🕵️‍♂️`);
    const report = await this.prisma.previousLabReport.findUnique({
      where: { id },
    });
    if (!report) {
      this.logger.warn(`[⚠️ Lab Report Not Found] id: ${id} ❌`);
      throw new NotFoundException('Lab Report not found');
    }
    this.logger.log(`[✅ Lab Report Found] id: ${id} 👌`);
    return report;
  }

  async update(
    id: number,
    data: { description?: string | null; file_url?: string },
  ) {
    this.logger.log(
      `[✏️ Update Lab Report] id: ${id}, data: ${JSON.stringify(data)} 🔄`,
    );
    const report = await this.prisma.previousLabReport.findUnique({
      where: { id },
    });
    if (!report) {
      this.logger.warn(`[⚠️ Update Failed - Not Found] id: ${id} 😕`);
      throw new NotFoundException('Lab Report not found');
    }
    const updated = await this.prisma.previousLabReport.update({
      where: { id },
      data,
    });
    this.logger.log(`[✅ Lab Report Updated] id: ${id} 🎉`);
    return updated;
  }

  async remove(id: number) {
    this.logger.log(`[🗑️ Delete Lab Report] id: ${id} 🧹`);
    const record = await this.prisma.previousLabReport.findUnique({
      where: { id },
    });
    if (!record) {
      this.logger.warn(`[⚠️ Delete Failed - Not Found] id: ${id} 🚫`);
      throw new NotFoundException('Lab Report not found');
    }
    const deleted = await this.prisma.previousLabReport.delete({
      where: { id },
    });
    this.logger.log(`[✅ Lab Report Deleted] id: ${id} 💥`);
    return deleted;
  }
}
