import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createConversationDto: CreateConversationDto,
    audioFile: Express.Multer.File,
  ) {
    const { doctor_id, patient_id, appointment_id } = createConversationDto;

    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctor_id,
        role: { role_name: 'doctor' },
      },
    });

    if (!doctor) {
      throw new BadRequestException(
        'Invalid doctor ID or user is not a doctor',
      );
    }

    const patient = await this.prisma.user.findFirst({
      where: {
        id: patient_id,
        role: { role_name: 'patient' },
      },
    });

    if (!patient) {
      throw new BadRequestException(
        'Invalid patient ID or user is not a patient',
      );
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointment_id,
        slot: {
          user_id: doctor_id,
        },
        user_id: patient_id,
      },
    });

    if (!appointment) {
      throw new BadRequestException(
        'Invalid appointment or appointment does not belong to specified doctor and patient',
      );
    }

    const file = await this.saveAudioFile(audioFile);
    const conversation_date = new Date();

    const conversation = await this.prisma.conversation.create({
      data: {
        doctor_id,
        patient_id,
        file_id: file.id,
        appointment_id,
        duration_mins: 0,
        conversation_date,
      },
      include: {
        doctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        file: {
          select: {
            id: true,
            file_name: true,
            file_URL: true,
            file_type: true,
          },
        },
        appointment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return {
      message: 'Conversation created successfully',
      data: conversation,
    };
  }

  private async saveAudioFile(audioFile: Express.Multer.File): Promise<any> {
    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'];
    if (!allowedTypes.includes(audioFile.mimetype)) {
      throw new BadRequestException(
        'Only audio files (MP3, WAV, M4A) are allowed',
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = audioFile.originalname.split('.').pop();
    const fileName = `conversation_${timestamp}_${randomString}.${fileExtension}`;
    const fileURL = `/uploads/${fileName}`;

    const file = await this.prisma.file.create({
      data: {
        file_name: fileName,
        file_URL: fileURL,
        file_type: audioFile.mimetype,
        file_extension: fileExtension || '',
        source: 'upload',
      },
    });

    return file;
  }

  private async downloadFile(url: string, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      const request = url.startsWith('https') ? https.get : http.get;

      request(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
  }

  async findAll() {
    return this.prisma.conversation.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        file: {
          select: {
            id: true,
            file_name: true,
            file_URL: true,
          },
        },
      },
      orderBy: {
        conversation_date: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        file: {
          select: {
            id: true,
            file_name: true,
            file_URL: true,
            file_type: true,
          },
        },
        appointment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async findByDoctor(doctorId: number) {
    return this.prisma.conversation.findMany({
      where: { doctor_id: doctorId },
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        file: {
          select: {
            id: true,
            file_name: true,
            file_URL: true,
          },
        },
      },
      orderBy: {
        conversation_date: 'desc',
      },
    });
  }

  async findByPatient(patientId: number) {
    return this.prisma.conversation.findMany({
      where: { patient_id: patientId },
      include: {
        doctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        file: {
          select: {
            id: true,
            file_name: true,
            file_URL: true,
          },
        },
      },
      orderBy: {
        conversation_date: 'desc',
      },
    });
  }

  // New method: Get all conversations between a specific doctor and patient
  async findConversationsBetweenDoctorAndPatient(
    doctorId: number,
    patientId: number,
  ) {
    // Verify doctor exists and has correct role
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctorId,
        role: { role_name: 'doctor' },
      },
    });

    if (!doctor) {
      throw new BadRequestException(
        'Invalid doctor ID or user is not a doctor',
      );
    }

    // Verify patient exists and has correct role
    const patient = await this.prisma.user.findFirst({
      where: {
        id: patientId,
        role: { role_name: 'patient' },
      },
    });

    if (!patient) {
      throw new BadRequestException(
        'Invalid patient ID or user is not a patient',
      );
    }

    const conversations = await this.prisma.conversation.findMany({
      where: {
        doctor_id: doctorId,
        patient_id: patientId,
      },
      include: {
        doctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        file: {
          select: {
            id: true,
            file_name: true,
            file_URL: true,
            file_type: true,
          },
        },
        appointment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        conversation_date: 'desc',
      },
    });

    return {
      message: `Found ${conversations.length} conversations between doctor ${doctor.first_name} ${doctor.last_name} and patient ${patient.first_name} ${patient.last_name}`,
      data: conversations,
    };
  }

  // New method: Get a specific conversation between a doctor and patient
  async findSpecificConversationBetweenDoctorAndPatient(
    doctorId: number,
    patientId: number,
    conversationId: number,
  ) {
    // Verify doctor exists and has correct role
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctorId,
        role: { role_name: 'doctor' },
      },
    });

    if (!doctor) {
      throw new BadRequestException(
        'Invalid doctor ID or user is not a doctor',
      );
    }

    // Verify patient exists and has correct role
    const patient = await this.prisma.user.findFirst({
      where: {
        id: patientId,
        role: { role_name: 'patient' },
      },
    });

    if (!patient) {
      throw new BadRequestException(
        'Invalid patient ID or user is not a patient',
      );
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        doctor_id: doctorId,
        patient_id: patientId,
      },
      include: {
        doctor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        file: {
          select: {
            id: true,
            file_name: true,
            file_URL: true,
            file_type: true,
          },
        },
        appointment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found or does not belong to the specified doctor and patient',
      );
    }

    return {
      message: 'Conversation found successfully',
      data: conversation,
    };
  }

  async remove(id: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.prisma.conversation.delete({
      where: { id },
    });

    return {
      message: 'Conversation deleted successfully',
    };
  }
}
