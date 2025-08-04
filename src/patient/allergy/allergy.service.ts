import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Injectable()
export class AllergyService {
  private readonly logger = new Logger(AllergyService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateAllergyDto) {
    this.logger.log(
      `[➕ Create Allergy] Creating allergy for userId: ${userId} 🤧`,
    );
    const result = await this.prisma.allergy.create({
      data: {
        user_id: userId,
        allergy_name: dto.allergy_name,
        allergy_type: dto.allergy_type,
        condition: dto.condition,
        reactions: dto.reactions,
        note: dto.note,
        status: dto.status ?? 'active',
      },
    });
    this.logger.log(
      `[✅ Create Allergy] Allergy created with ID: ${result.id} 🆔`,
    );
    return result;
  }

  async findAll(userId: number) {
    this.logger.log(
      `[📄 Fetch Allergies] Fetching all allergies for userId: ${userId} 🔍`,
    );
    const results = await this.prisma.allergy.findMany({
      where: { user_id: userId },
      orderBy: {
        created_at: 'desc',
      },
    });
    this.logger.log(
      `[📊 Fetch Complete] Found ${results.length} allergies for userId: ${userId}`,
    );
    return results;
  }

  async findOne(id: number) {
    this.logger.log(`[🔎 Find Allergy] Looking for allergy with ID: ${id}`);
    const allergy = await this.prisma.allergy.findUnique({ where: { id } });
    if (!allergy) {
      this.logger.warn(`[❌ Not Found] Allergy with ID ${id} not found!`);
      throw new NotFoundException('Allergy not found');
    }
    this.logger.log(`[✅ Found] Allergy found with ID: ${id}`);
    return allergy;
  }

  async update(id: number, dto: UpdateAllergyDto) {
    this.logger.log(`[✏️ Update Allergy] Updating allergy with ID: ${id}`);
    await this.findOne(id);
    const result = await this.prisma.allergy.update({
      where: { id },
      data: dto,
    });
    this.logger.log(`[✅ Update Success] Allergy updated with ID: ${id}`);
    return result;
  }

  async remove(id: number) {
    this.logger.log(
      `[🗑️ Delete Request] Attempting to delete allergy with ID: ${id}`,
    );
    await this.findOne(id);
    const result = await this.prisma.allergy.delete({ where: { id } });
    this.logger.log(`[✅ Deleted] Allergy deleted with ID: ${id}`);
    return result;
  }
}
