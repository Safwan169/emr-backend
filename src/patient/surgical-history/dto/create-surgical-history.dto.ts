import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateSurgicalHistoryDto {
  @IsInt()
  medical_history_type_id: number;

  @IsString()
  @IsNotEmpty()
  procedure: string;

  @IsDateString()
  surgery_date: string;

  @IsString()
  @IsNotEmpty()
  surgeon_name: string;

  @IsString()
  @IsNotEmpty()
  hospital_name: string;

  @IsOptional()
  @IsString()
  complications?: string;
}
