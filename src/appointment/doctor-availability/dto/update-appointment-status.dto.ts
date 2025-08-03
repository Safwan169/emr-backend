import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus, {
    message: 'Status must be one of: confirmed, cancelled, completed',
  })
  status: AppointmentStatus;
}
