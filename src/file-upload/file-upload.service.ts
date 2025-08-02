import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import * as mime from 'mime-types';
import { extname, join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(private prisma: PrismaService) {}

  private ensureUploadsFolder(): string {
    const uploadPath = join(process.cwd(), 'uploads');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
      this.logger.log(`Created uploads folder at ${uploadPath}`);
    }
    return uploadPath;
  }

  async handleUpload(file: Express.Multer.File) {
    this.logger.log(`Handling file upload: ${file.originalname}`);
    if (!file || !file.buffer) {
      this.logger.error('Invalid file upload: No data received in buffer');
      throw new Error('Invalid file upload: No data received in buffer');
    }

    try {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
      const uploadDir = this.ensureUploadsFolder();
      const fullPath = join(uploadDir, uniqueName);

      await writeFile(fullPath, file.buffer);
      this.logger.log(`File saved to disk: ${fullPath}`);

      const savedFile = await this.prisma.file.create({
        data: {
          file_name: file.originalname,
          file_URL: `/uploads/${uniqueName}`,
          file_type: file.mimetype.split('/')[0],
          file_extension: file.originalname.split('.').pop() || '',
          source: 'upload',
        },
      });

      this.logger.log(`File record created in DB with id: ${savedFile.id}`);
      return savedFile;
    } catch (error) {
      this.logger.error(
        `Failed to handle file upload: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async handleExternalLink(link: string) {
    this.logger.log(`Handling external link: ${link}`);

    const isYoutube = link.includes('youtube.com') || link.includes('youtu.be');

    let fileType = 'external';
    let fileExtension = 'link';

    if (isYoutube) {
      fileType = 'video';
      fileExtension = 'youtube';
    } else {
      try {
        const res = await axios.head(link);
        const mimeType = res.headers['content-type'];

        if (mimeType) {
          fileType = mimeType.split('/')[0];
          fileExtension = mime.extension(mimeType) || 'link';
        }
      } catch (e) {
        this.logger.warn(`HEAD request failed for link ${link}: ${e.message}`);
      }
    }

    try {
      const savedFile = await this.prisma.file.create({
        data: {
          file_name: link.split('/').pop()?.slice(0, 50) || 'external_link',
          file_URL: link,
          file_type: fileType,
          file_extension: fileExtension,
          source: 'link',
        },
      });

      this.logger.log(
        `External link record created in DB with id: ${savedFile.id}`,
      );
      return savedFile;
    } catch (error) {
      this.logger.error(
        `Failed to create external link record: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
