import {
  Controller,
  Post,
  Param,
  Body,
  HttpStatus,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
  Get,
  Delete,
  Logger,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DoctorProfileService } from './doctor-profile.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { CreateDoctorEducationDto } from './dto/create-doctor-profile-education.dto';
import { CreateDoctorCertificationDto } from './dto/create-doctor-profile-certification.dto';
import { CreateDoctorResearchDto } from './dto/create-doctor-profile-research.dto';
import { successResponse } from 'src/common/response.handler';

@Controller('DoctorProfile')
export class DoctorProfileController {
  private readonly logger = new Logger(DoctorProfileController.name);
  constructor(private readonly doctorProfileService: DoctorProfileService) {}

  //! Get all doctors
  @Get()
  async getAllDoctors() {
    const doctors = await this.doctorProfileService.getAllDoctors();
    return successResponse(
      doctors,
      'List of all doctors retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Get(':UserId')
  async getDoctorProfileByUserId(
    @Param('UserId', ParseIntPipe) UserId: number,
  ) {
    this.logger.log(
      `🔍 Request received: Get doctor profile for userId=${UserId}`,
    );
    const profile =
      await this.doctorProfileService.getDoctorProfileByUserIdWithRelations(
        UserId,
      );
    return successResponse(
      profile,
      'Doctor profile retrieved successfully',
      HttpStatus.OK,
    );
  }

  //! Create or update doctor profile with voice file only
  @Post(':UserId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'voice', maxCount: 1 }]))
  async createOrUpdateProfile(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateDoctorProfileDto,
    @UploadedFiles()
    files: {
      voice?: Express.Multer.File[];
    },
  ) {
    const voiceFile = files?.voice?.[0];

    const profile = await this.doctorProfileService.createOrUpdateProfile(
      UserId,
      dto,
      voiceFile,
    );

    return successResponse(
      profile,
      'Doctor profile saved successfully!',
      HttpStatus.CREATED,
    );
  }

  //! Education create or update
  @Post(':UserId/Education')
  async createOrUpdateEducation(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateDoctorEducationDto,
  ) {
    const education =
      await this.doctorProfileService.createOrUpdateDoctorEducation(
        UserId,
        dto,
      );
    return successResponse(
      education,
      'Doctor education saved successfully!',
      HttpStatus.CREATED,
    );
  }

  //! Certification create or update
  @Post(':UserId/Certification')
  async createOrUpdateCertification(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateDoctorCertificationDto,
  ) {
    const certification =
      await this.doctorProfileService.createOrUpdateDoctorCertification(
        UserId,
        dto,
      );
    return successResponse(
      certification,
      'Doctor certification saved successfully!',
      HttpStatus.CREATED,
    );
  }

  //! Research create or update
  @Post(':UserId/Research')
  async createOrUpdateResearch(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateDoctorResearchDto,
  ) {
    const research =
      await this.doctorProfileService.createOrUpdateDoctorResearch(UserId, dto);
    return successResponse(
      research,
      'Doctor research saved successfully!',
      HttpStatus.CREATED,
    );
  }

  //! Delete Education by ID for a specific doctor user
  @Delete(':UserId/Education/:EducationId')
  async deleteEducation(
    @Param('UserId', ParseIntPipe) userId: number,
    @Param('educationId', ParseIntPipe) EducationId: number,
  ) {
    const result = await this.doctorProfileService.deleteDoctorEducation(
      userId,
      EducationId,
    );
    return successResponse(
      result,
      'Education deleted successfully',
      HttpStatus.OK,
    );
  }

  //! Delete Certification by ID for a specific doctor user
  @Delete(':UserId/Certification/:CertificationId')
  async deleteCertification(
    @Param('UserId', ParseIntPipe) userId: number,
    @Param('CertificationId', ParseIntPipe) CertificationId: number,
  ) {
    const result = await this.doctorProfileService.deleteDoctorCertification(
      userId,
      CertificationId,
    );
    return successResponse(
      result,
      'Certification deleted successfully',
      HttpStatus.OK,
    );
  }

  //! Delete Research by ID for a specific doctor user
  @Delete(':UserId/Research/:ResearchId')
  async deleteResearch(
    @Param('UserId', ParseIntPipe) userId: number,
    @Param('researchId', ParseIntPipe) ResearchId: number,
  ) {
    const result = await this.doctorProfileService.deleteDoctorResearch(
      userId,
      ResearchId,
    );
    return successResponse(
      result,
      'Research deleted successfully',
      HttpStatus.OK,
    );
  }
}
