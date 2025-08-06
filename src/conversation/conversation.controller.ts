import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('Conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('audioFile', {
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'audio/mpeg',
          'audio/mp3',
          'audio/wav',
          'audio/m4a',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only audio files are allowed'), false);
        }
      },
    }),
  )
  async create(
    @Body() createConversationDto: CreateConversationDto,
    @UploadedFile() audioFile: Express.Multer.File,
  ) {
    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    return this.conversationService.create(createConversationDto, audioFile);
  }

  @Get()
  async findAll() {
    return this.conversationService.findAll();
  }

  @Get(':Id')
  async findOne(@Param('Id', ParseIntPipe) Id: number) {
    return this.conversationService.findOne(Id);
  }

  @Get('Doctor/:DoctorId')
  async findByDoctor(@Param('DoctorId', ParseIntPipe) DoctorId: number) {
    return this.conversationService.findByDoctor(DoctorId);
  }

  @Get('Patient/:PatientId')
  async findByPatient(@Param('PatientId', ParseIntPipe) PatientId: number) {
    return this.conversationService.findByPatient(PatientId);
  }

  // New endpoint: Get all conversations between a specific doctor and patient
  @Get('Doctor/:DoctorId/Patient/:PatientId/Conversations')
  async findConversationsBetweenDoctorAndPatient(
    @Param('DoctorId', ParseIntPipe) DoctorId: number,
    @Param('PatientId', ParseIntPipe) PatientId: number,
  ) {
    return this.conversationService.findConversationsBetweenDoctorAndPatient(
      DoctorId,
      PatientId,
    );
  }

  // New endpoint: Get a specific conversation between a doctor and patient
  @Get('Doctor/:DoctorId/Patient/:PatientId/Conversation/:ConversationId')
  async findSpecificConversationBetweenDoctorAndPatient(
    @Param('DoctorId', ParseIntPipe) DoctorId: number,
    @Param('PatientId', ParseIntPipe) PatientId: number,
    @Param('ConversationId', ParseIntPipe) ConversationId: number,
  ) {
    return this.conversationService.findSpecificConversationBetweenDoctorAndPatient(
      DoctorId,
      PatientId,
      ConversationId,
    );
  }

  @Delete(':Id')
  async remove(@Param('Id', ParseIntPipe) Id: number) {
    return this.conversationService.remove(Id);
  }
}
