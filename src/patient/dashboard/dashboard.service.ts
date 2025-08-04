import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async countByUserId(userId: number) {
    this.logger.log(
      `[📊 Count Previous Prescriptions] Counting for userId: ${userId} 🔢`,
    );
    const count = await this.prisma.previousPrescription.count({
      where: {
        user_id: userId,
      },
    });
    this.logger.log(
      `[✅ Count Result] userId: ${userId}, total_previous_prescription: ${count} 🧾`,
    );
    return {
      user_id: userId,
      total_previous_prescription: count,
    };
  }

  async countPreviousLabReport(userId: number) {
    this.logger.log(
      `[📈 Count Previous Lab Reports] Counting for userId: ${userId} 🧪`,
    );
    const count = await this.prisma.previousLabReport.count({
      where: {
        user_id: userId,
      },
    });
    this.logger.log(
      `[✅ Count Result] userId: ${userId}, total_previous_lab_report: ${count} 🔬`,
    );
    return {
      user_id: userId,
      total_previous_lab_report: count,
    };
  }

  async getPaginatedDoctorProfiles(
    page: number,
    limit: number,
    specialization?: string,
  ) {
    this.logger.log(
      `[🔍 Fetch Doctor Profiles] Page: ${page}, Limit: ${limit}, Specialization: ${specialization ?? 'N/A'} 🩺`,
    );

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

    this.logger.log(
      `[✅ Fetch Complete] Total Doctors: ${total}, Pages: ${Math.ceil(total / limit)} 📄`,
    );
    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: doctors,
    };
  }
}
