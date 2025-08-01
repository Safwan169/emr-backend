import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { multerOptions } from './utils/multer.config';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileUploadService.handleUpload(file);
  }

  @Post('link')
  async uploadLink(@Body('link') link: string) {
    return this.fileUploadService.handleExternalLink(link);
  }
}
