import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSurgicalHistoryDto } from './dto/create-surgical-history.dto';
import { UpdateSurgicalHistoryDto } from './dto/update-surgical-history.dto';

@Injectable()
export class SurgicalHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSurgicalHistoryDto) {
    try {
      const surgicalHistory = await this.prisma.surgicalHistory.create({
        data: {
          medical_history_type_id: dto.medical_history_type_id,
          procedure: dto.procedure,
          surgery_date: new Date(dto.surgery_date),
          surgeon_name: dto.surgeon_name,
          hospital_name: dto.hospital_name,
          complications: dto.complications,
        },
      });
      return surgicalHistory;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to create surgical history',
      );
    }
  }

  async findAll() {
    return this.prisma.surgicalHistory.findMany({
      include: {
        medical_history_type: true,
      },
    });
  }

 async update(id: number, dto: UpdateSurgicalHistoryDto) {
  const existing = await this.prisma.surgicalHistory.findUnique({ where: { id } });
  if (!existing) throw new NotFoundException('Surgical history not found');

  return this.prisma.surgicalHistory.update({
    where: { id },
    data: {
      procedure: dto.procedure,
      surgeon_name: dto.surgeon_name,
      hospital_name: dto.hospital_name,
      complications: dto.complications,
      ...(dto.surgery_date && { surgery_date: new Date(dto.surgery_date) }), // ✅ only if surgery_date is provided
    },
  });
}


  async remove(id: number) {
  const existing = await this.prisma.surgicalHistory.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundException('Surgical history not found');
  }

  await this.prisma.surgicalHistory.delete({
    where: { id },
  });

  return { message: 'Surgical history deleted successfully' };
}

}
