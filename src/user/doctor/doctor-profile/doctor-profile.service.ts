import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { unlink } from 'fs/promises';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';

@Injectable()
export class DoctorProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getAllDoctors() {
    return this.prisma.doctorProfile.findMany({
      include: {
        user: true, // Include basic user info, adjust as needed
        image_file: true,
        DoctorCertification: true,
        DoctorProfileEducationAndQualification: true,
        DoctorResearchAndPublication: true,
      },
    });
  }

  async createOrUpdateProfile(
    userId: number,
    dto: CreateDoctorProfileDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.role.role_name.toLowerCase() !== 'doctor') {
      throw new BadRequestException('Only doctors can have a doctor profile');
    }

    let imageId: number | null = null;

    const existingProfile = await this.prisma.doctorProfile.findUnique({
      where: { user_id: userId },
      include: { image_file: true },
    });

    if (existingProfile?.image_file && file) {
      if (existingProfile.image_file.source === 'upload') {
        const filePath = `./uploads/${existingProfile.image_file.file_URL.split('/').pop()}`;
        try {
          await unlink(filePath);
        } catch (err) {
          console.warn('File delete error:', err.message);
        }
      }

      await this.prisma.file.delete({
        where: { id: existingProfile.image_file.id },
      });
    }

    if (file) {
      const uploadedFile = await this.fileUploadService.handleUpload(file);
      imageId = uploadedFile.id;
    } else if ((dto as any).image_URL) {
      const externalFile = await this.fileUploadService.handleExternalLink(
        (dto as any).image_URL,
      );
      imageId = externalFile.id;
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

    if (imageId) {
      dataToSave.image_file = { connect: { id: imageId } }; // ✅ Correct relation
    }

    const profile = await this.prisma.doctorProfile.upsert({
      where: { user_id: userId },
      create: dataToSave,
      update: dataToSave,
    });

    return profile;
  }
}
