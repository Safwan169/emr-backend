import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, PrismaService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
