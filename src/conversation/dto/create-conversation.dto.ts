import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  doctor_id: number;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  patient_id: number;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  appointment_id: number;
}
