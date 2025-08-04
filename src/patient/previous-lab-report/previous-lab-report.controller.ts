import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  Body,
  UseInterceptors,
  Delete,
  Patch,
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
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
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

  @Get('Single/:Id')
  async findOne(@Param('Id') Id: number) {
    return this.service.findOne(+Id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const updateData: any = {
      description: body.description || null,
    };

    if (file) {
      updateData.file_url = `/uploads/${file.filename}`;
    }

    return this.service.update(+id, updateData);
  }

  @Delete(':Id')
  async remove(@Param('Id') Id: number) {
    return this.service.remove(+Id);
  }
}
