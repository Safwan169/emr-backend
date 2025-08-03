import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Injectable()
export class AllergyService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, dto: CreateAllergyDto) {
    return this.prisma.allergy.create({
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
  }

  findAll(userId: number) {
    return this.prisma.allergy.findMany({
      where: { user_id: userId },
    });
  }

  async findOne(id: number) {
    const allergy = await this.prisma.allergy.findUnique({ where: { id } });
    if (!allergy) throw new NotFoundException('Allergy not found');
    return allergy;
  }

  async update(id: number, dto: UpdateAllergyDto) {
    await this.findOne(id); // check if exists
    return this.prisma.allergy.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.allergy.delete({ where: { id } });
  }
}
