import {
  Controller,
  Post,
  Put,
  Param,
  Body,
  HttpStatus,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DoctorProfileService } from './doctor-profile.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { successResponse } from 'src/common/response.handler';

@Controller('DoctorProfile')
export class DoctorProfileController {
  constructor(private readonly doctorProfileService: DoctorProfileService) {}

  @Get()
  async getAllDoctors() {
    const doctors = await this.doctorProfileService.getAllDoctors();
    return successResponse(
      doctors,
      '👩‍⚕️ List of all doctors retrieved successfully',
      HttpStatus.OK,
    );
  }

  @Post(':UserId')
  @UseInterceptors(FileInterceptor('image'))
  async createOrUpdateProfile(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateDoctorProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const profile = await this.doctorProfileService.createOrUpdateProfile(
      UserId,
      dto,
      file,
    );

    return successResponse(
      profile,
      '🩺 Doctor profile saved successfully!',
      HttpStatus.CREATED,
    );
  }
}
