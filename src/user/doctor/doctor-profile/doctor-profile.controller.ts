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
  Put,
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

  // ============================================================
  // ==================== EDUCATION ENDPOINTS ====================
  // ============================================================

  //! Create new education entry
  @Post(':UserId/Education')
  async createEducation(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateDoctorEducationDto,
  ) {
    this.logger.log(
      `📚 Request received: Create education for userId=${UserId}`,
    );
    const education = await this.doctorProfileService.createDoctorEducation(
      UserId,
      dto,
    );
    return successResponse(
      education,
      'Doctor education created successfully!',
      HttpStatus.CREATED,
    );
  }

  //! Update specific education entry
  @Put(':UserId/Education/:EducationId')
  async updateEducation(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Param('EducationId', ParseIntPipe) EducationId: number,
    @Body() dto: CreateDoctorEducationDto,
  ) {
    this.logger.log(
      `📚 Request received: Update education id=${EducationId} for userId=${UserId}`,
    );
    const education = await this.doctorProfileService.updateDoctorEducation(
      UserId,
      EducationId,
      dto,
    );
    return successResponse(
      education,
      'Doctor education updated successfully!',
      HttpStatus.OK,
    );
  }

  //! Delete Education by ID for a specific doctor user
  @Delete(':UserId/Education/:EducationId')
  async deleteEducation(
    @Param('UserId', ParseIntPipe) userId: number,
    @Param('EducationId', ParseIntPipe) EducationId: number,
  ) {
    this.logger.log(
      `🗑️ Request received: Delete education id=${EducationId} for userId=${userId}`,
    );
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

  // ============================================================
  // ==================== CERTIFICATION ENDPOINTS ====================
  // ============================================================

  //! Create new certification entry
  @Post(':UserId/Certification')
  async createCertification(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateDoctorCertificationDto,
  ) {
    this.logger.log(
      `🏆 Request received: Create certification for userId=${UserId}`,
    );
    const certification =
      await this.doctorProfileService.createDoctorCertification(UserId, dto);
    return successResponse(
      certification,
      'Doctor certification created successfully!',
      HttpStatus.CREATED,
    );
  }

  //! Update specific certification entry
  @Put(':UserId/Certification/:CertificationId')
  async updateCertification(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Param('CertificationId', ParseIntPipe) CertificationId: number,
    @Body() dto: CreateDoctorCertificationDto,
  ) {
    this.logger.log(
      `🏆 Request received: Update certification id=${CertificationId} for userId=${UserId}`,
    );
    const certification =
      await this.doctorProfileService.updateDoctorCertification(
        UserId,
        CertificationId,
        dto,
      );
    return successResponse(
      certification,
      'Doctor certification updated successfully!',
      HttpStatus.OK,
    );
  }

  //! Delete Certification by ID for a specific doctor user
  @Delete(':UserId/Certification/:CertificationId')
  async deleteCertification(
    @Param('UserId', ParseIntPipe) userId: number,
    @Param('CertificationId', ParseIntPipe) CertificationId: number,
  ) {
    this.logger.log(
      `🗑️ Request received: Delete certification id=${CertificationId} for userId=${userId}`,
    );
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

  // ============================================================
  // ==================== RESEARCH ENDPOINTS ====================
  // ============================================================

  //! Create new research entry
  @Post(':UserId/Research')
  async createResearch(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateDoctorResearchDto,
  ) {
    this.logger.log(
      `🔬 Request received: Create research for userId=${UserId}`,
    );
    const research = await this.doctorProfileService.createDoctorResearch(
      UserId,
      dto,
    );
    return successResponse(
      research,
      'Doctor research created successfully!',
      HttpStatus.CREATED,
    );
  }

  //! Update specific research entry
  @Put(':UserId/Research/:ResearchId')
  async updateResearch(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Param('ResearchId', ParseIntPipe) ResearchId: number,
    @Body() dto: CreateDoctorResearchDto,
  ) {
    this.logger.log(
      `🔬 Request received: Update research id=${ResearchId} for userId=${UserId}`,
    );
    const research = await this.doctorProfileService.updateDoctorResearch(
      UserId,
      ResearchId,
      dto,
    );
    return successResponse(
      research,
      'Doctor research updated successfully!',
      HttpStatus.OK,
    );
  }

  //! Delete Research by ID for a specific doctor user
  @Delete(':UserId/Research/:ResearchId')
  async deleteResearch(
    @Param('UserId', ParseIntPipe) userId: number,
    @Param('ResearchId', ParseIntPipe) ResearchId: number,
  ) {
    this.logger.log(
      `🗑️ Request received: Delete research id=${ResearchId} for userId=${userId}`,
    );
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
