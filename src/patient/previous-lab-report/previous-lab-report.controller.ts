import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  Body,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PreviousLabReportService } from './previous-lab-report.service';

@Controller('MedicalHistory/PreviousLabReport')
export class PreviousLabReportController {
  constructor(private readonly service: PreviousLabReportService) {}

  @Post(':user_id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @Param('user_id') userId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const file_url = `/uploads/${file.filename}`;
    const description = body.description || null;
    return this.service.create(+userId, { description, file_url });
  }

  @Get(':user_id')
  async findAll(@Param('user_id') userId: number) {
    return this.service.findAll(+userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
