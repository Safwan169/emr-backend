import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class BookAppointmentDto {
  @IsInt()
  slot_id: number;

  @IsInt()
  doctor_id: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}
