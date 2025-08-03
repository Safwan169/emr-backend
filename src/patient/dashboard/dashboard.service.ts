import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async countByUserId(userId:number){
        const count=await this.prisma.previousPrescription.count({
            where:{
                user_id:userId
            },
        });

        return{
            user_id:userId,
            total_previous_prescription:count,
        };
    }

    async countPreviousLabReport(userId:number){
        const count=await this.prisma.previousLabReport.count({
            where:{
                user_id:userId
            },
        });
        return{
            user_id:userId,
            total_previous_lab_report:count
        };
    }

     async getPaginatedDoctorProfiles(page: number, limit: number, specialization?: string) {
  const skip = (page - 1) * limit;

  const where = specialization
    ? {
        specialization: {
          contains: specialization,
          mode: 'insensitive' as const,
        },
      }
    : {};

  const [doctors, total] = await this.prisma.$transaction([
    this.prisma.doctorProfile.findMany({
      skip,
      take: limit,
      where,
      include: {
        user: true,
        DoctorCertification: true,
        DoctorProfileEducationAndQualification: true,
        DoctorResearchAndPublication: true,
        test_voice_file: true,
        File: true,
      },
    }),
    this.prisma.doctorProfile.count({ where }),
  ]);

  return {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    data: doctors,
  };
}



}
