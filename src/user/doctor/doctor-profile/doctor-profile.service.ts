import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { unlink } from 'fs/promises';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { CreateDoctorEducationDto } from './dto/create-doctor-profile-education.dto';
import { CreateDoctorCertificationDto } from './dto/create-doctor-profile-certification.dto';
import { CreateDoctorResearchDto } from './dto/create-doctor-profile-research.dto';

@Injectable()
export class DoctorProfileService {
  private readonly logger = new Logger(DoctorProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getAllDoctors() {
    this.logger.log('📋 Fetching all doctor profiles...');
    const doctors = await this.prisma.doctorProfile.findMany({
      include: {
        user: true,
        test_voice_file: true,
        DoctorCertification: true,
        DoctorProfileEducationAndQualification: true,
        DoctorResearchAndPublication: true,
      },
    });
    this.logger.log(`✅ Retrieved ${doctors.length} doctor profiles`);
    return doctors;
  }

  async getDoctorProfileByUserIdWithRelations(userId: number) {
    this.logger.log(
      `🔍 Fetching detailed doctor profile for userId=${userId}...`,
    );

    const profile = await this.prisma.doctorProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: true,
        test_voice_file: true,
        DoctorCertification: true,
        DoctorProfileEducationAndQualification: true,
        DoctorResearchAndPublication: true,
      },
    });

    if (!profile) {
      this.logger.warn(`⚠️ Doctor profile not found for userId=${userId}`);
      throw new NotFoundException('Doctor profile not found for user');
    }

    this.logger.log(
      `✅ Found doctor profile for userId=${userId} (Doctor Profile Id=${profile.id})`,
    );
    return profile;
  }

  async getDoctorProfileByUserId(userId: number) {
    this.logger.log(`🔍 Fetching doctor profile for userId=${userId}...`);
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      this.logger.warn(`⚠️ Doctor profile not found for userId=${userId}`);
      throw new NotFoundException('Doctor profile not found for user');
    }

    this.logger.log(
      `✅ Doctor profile found for userId=${userId} (id=${profile.id})`,
    );
    return profile;
  }

  async createOrUpdateProfile(
    userId: number,
    dto: CreateDoctorProfileDto,
    voiceFile?: Express.Multer.File,
  ) {
    this.logger.log(
      `✏️ Creating/updating doctor profile for userId=${userId}...`,
    );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      this.logger.warn(`⚠️ User not found: userId=${userId}`);
      throw new NotFoundException('User not found');
    }

    if (user.role.role_name.toLowerCase() !== 'doctor') {
      this.logger.warn(`❌ User is not a doctor: userId=${userId}`);
      throw new BadRequestException('Only doctors can have a doctor profile');
    }

    // Load existing profile with voice file
    const existingProfile = await this.prisma.doctorProfile.findUnique({
      where: { user_id: userId },
      include: { test_voice_file: true },
    });

    if (existingProfile?.test_voice_file && voiceFile) {
      if (existingProfile.test_voice_file.source === 'upload') {
        const filePath = `./uploads/${existingProfile.test_voice_file.file_URL.split('/').pop()}`;
        try {
          await unlink(filePath);
          this.logger.log(
            `🗑️ Deleted old voice file from disk for userId=${userId}`,
          );
        } catch (err) {
          this.logger.warn(
            `⚠️ Voice file delete error for userId=${userId}: ${err.message}`,
          );
        }
      }
      await this.prisma.file.delete({
        where: { id: existingProfile.test_voice_file.id },
      });
      this.logger.log(`🗑️ Deleted old voice file record for userId=${userId}`);
    }

    let voiceFileId: number | null = null;
    if (voiceFile) {
      const uploadedVoice =
        await this.fileUploadService.handleUpload(voiceFile);
      voiceFileId = uploadedVoice.id;
      this.logger.log(
        `⬆️ Uploaded new voice file id=${voiceFileId} for userId=${userId}`,
      );
    } else if ((dto as any).voice_URL) {
      const externalVoice = await this.fileUploadService.handleExternalLink(
        (dto as any).voice_URL,
      );
      voiceFileId = externalVoice.id;
      this.logger.log(
        `🔗 Linked external voice file id=${voiceFileId} for userId=${userId}`,
      );
    }

    const dataToSave: any = {
      license_number: dto.license_number,
      specialization: dto.specialization,
      fee: dto.fee,
      rating: dto.rating,
      years_of_experience: dto.years_of_experience,
      phone: dto.phone,
      hospital: dto.hospital,
      user: { connect: { id: userId } },
    };

    if (voiceFileId) {
      dataToSave.test_voice_file = { connect: { id: voiceFileId } };
    }

    const profile = await this.prisma.doctorProfile.upsert({
      where: { user_id: userId },
      create: dataToSave,
      update: dataToSave,
    });

    this.logger.log(
      `✅ Doctor profile saved for userId=${userId} with profileId=${profile.id}`,
    );

    return profile;
  }

  async createOrUpdateDoctorEducation(
    userId: number,
    dto: CreateDoctorEducationDto,
  ) {
    this.logger.log(`✏️ Creating/updating education for userId=${userId}...`);

    const profile = await this.getDoctorProfileByUserId(userId);

    if (dto.id) {
      const existing =
        await this.prisma.doctorProfileEducationAndQualification.findUnique({
          where: { id: dto.id },
        });
      if (!existing) {
        this.logger.warn(`⚠️ Education id=${dto.id} not found for update`);
        throw new NotFoundException('Doctor education not found');
      }
      const updated =
        await this.prisma.doctorProfileEducationAndQualification.update({
          where: { id: dto.id },
          data: {
            title: dto.title,
            institution: dto.institution,
            achievement: dto.achievement,
            timeline: dto.timeline,
          },
        });
      this.logger.log(`✅ Updated education id=${dto.id} for userId=${userId}`);
      return updated;
    } else {
      const created =
        await this.prisma.doctorProfileEducationAndQualification.create({
          data: {
            title: dto.title,
            institution: dto.institution,
            achievement: dto.achievement,
            timeline: dto.timeline,
            doctor_profile_id: profile.id,
          },
        });
      this.logger.log(
        `✅ Created new education id=${created.id} for userId=${userId}`,
      );
      return created;
    }
  }

  async createOrUpdateDoctorCertification(
    userId: number,
    dto: CreateDoctorCertificationDto,
  ) {
    this.logger.log(
      `✏️ Creating/updating certification for userId=${userId}...`,
    );

    const profile = await this.getDoctorProfileByUserId(userId);

    if (dto.id) {
      const existing = await this.prisma.doctorCertification.findUnique({
        where: { id: dto.id },
      });
      if (!existing) {
        this.logger.warn(`⚠️ Certification id=${dto.id} not found for update`);
        throw new NotFoundException('Doctor certification not found');
      }
      const updated = await this.prisma.doctorCertification.update({
        where: { id: dto.id },
        data: {
          name: dto.name,
          certified_year: dto.certified_year,
          validation_year: dto.validation_year,
          institution: dto.institution,
        },
      });
      this.logger.log(
        `✅ Updated certification id=${dto.id} for userId=${userId}`,
      );
      return updated;
    } else {
      const created = await this.prisma.doctorCertification.create({
        data: {
          name: dto.name,
          certified_year: dto.certified_year,
          validation_year: dto.validation_year,
          institution: dto.institution,
          doctor_profile_id: profile.id,
        },
      });
      this.logger.log(
        `✅ Created new certification id=${created.id} for userId=${userId}`,
      );
      return created;
    }
  }

  async createOrUpdateDoctorResearch(
    userId: number,
    dto: CreateDoctorResearchDto,
  ) {
    this.logger.log(`✏️ Creating/updating research for userId=${userId}...`);

    const profile = await this.getDoctorProfileByUserId(userId);

    if (dto.id) {
      const existing =
        await this.prisma.doctorResearchAndPublication.findUnique({
          where: { id: dto.id },
        });
      if (!existing) {
        this.logger.warn(`⚠️ Research id=${dto.id} not found for update`);
        throw new NotFoundException('Doctor research/publication not found');
      }
      const updated = await this.prisma.doctorResearchAndPublication.update({
        where: { id: dto.id },
        data: {
          research_name: dto.research_name,
          publication_year: dto.publication_year,
          published_by: dto.published_by,
        },
      });
      this.logger.log(`✅ Updated research id=${dto.id} for userId=${userId}`);
      return updated;
    } else {
      const created = await this.prisma.doctorResearchAndPublication.create({
        data: {
          research_name: dto.research_name,
          publication_year: dto.publication_year,
          published_by: dto.published_by,
          doctor_profile_id: profile.id,
        },
      });
      this.logger.log(
        `✅ Created new research id=${created.id} for userId=${userId}`,
      );
      return created;
    }
  }

  async deleteDoctorEducation(userId: number, educationId: number) {
    this.logger.log(
      `🗑️ Deleting education id=${educationId} for userId=${userId}...`,
    );

    const profile = await this.getDoctorProfileByUserId(userId);

    const education =
      await this.prisma.doctorProfileEducationAndQualification.findUnique({
        where: { id: educationId },
      });
    if (!education) {
      this.logger.warn(`⚠️ Education id=${educationId} not found for deletion`);
      throw new NotFoundException('Doctor education not found');
    }

    if (education.doctor_profile_id !== profile.id) {
      this.logger.warn(
        `❌ Education id=${educationId} does not belong to userId=${userId}`,
      );
      throw new BadRequestException('Education does not belong to the doctor');
    }

    await this.prisma.doctorProfileEducationAndQualification.delete({
      where: { id: educationId },
    });

    this.logger.log(
      `✅ Deleted education id=${educationId} for userId=${userId}`,
    );
    return { message: 'Doctor education deleted successfully' };
  }

  async deleteDoctorCertification(userId: number, certificationId: number) {
    this.logger.log(
      `🗑️ Deleting certification id=${certificationId} for userId=${userId}...`,
    );

    const profile = await this.getDoctorProfileByUserId(userId);

    const certification = await this.prisma.doctorCertification.findUnique({
      where: { id: certificationId },
    });
    if (!certification) {
      this.logger.warn(
        `⚠️ Certification id=${certificationId} not found for deletion`,
      );
      throw new NotFoundException('Doctor certification not found');
    }

    if (certification.doctor_profile_id !== profile.id) {
      this.logger.warn(
        `❌ Certification id=${certificationId} does not belong to userId=${userId}`,
      );
      throw new BadRequestException(
        'Certification does not belong to the doctor',
      );
    }

    await this.prisma.doctorCertification.delete({
      where: { id: certificationId },
    });

    this.logger.log(
      `✅ Deleted certification id=${certificationId} for userId=${userId}`,
    );
    return { message: 'Doctor certification deleted successfully' };
  }

  async deleteDoctorResearch(userId: number, researchId: number) {
    this.logger.log(
      `🗑️ Deleting research id=${researchId} for userId=${userId}...`,
    );

    const profile = await this.getDoctorProfileByUserId(userId);

    const research = await this.prisma.doctorResearchAndPublication.findUnique({
      where: { id: researchId },
    });
    if (!research) {
      this.logger.warn(`⚠️ Research id=${researchId} not found for deletion`);
      throw new NotFoundException('Doctor research/publication not found');
    }

    if (research.doctor_profile_id !== profile.id) {
      this.logger.warn(
        `❌ Research id=${researchId} does not belong to userId=${userId}`,
      );
      throw new BadRequestException('Research does not belong to the doctor');
    }

    await this.prisma.doctorResearchAndPublication.delete({
      where: { id: researchId },
    });

    this.logger.log(
      `✅ Deleted research id=${researchId} for userId=${userId}`,
    );
    return { message: 'Doctor research/publication deleted successfully' };
  }
}
