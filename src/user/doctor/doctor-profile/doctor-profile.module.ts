import { Module } from '@nestjs/common';
import { DoctorProfileController } from './doctor-profile.controller';
import { DoctorProfileService } from './doctor-profile.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Module({
  controllers: [DoctorProfileController],
  providers: [DoctorProfileService, FileUploadService],
})
export class DoctorProfileModule {}
