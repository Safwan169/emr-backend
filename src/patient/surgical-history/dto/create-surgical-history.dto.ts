import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateSurgicalHistoryDto {
  @IsNotEmpty()
  @IsString()
  procedure: string;

  @IsNotEmpty()
  @IsDateString()
  surgery_date: string;

  @IsNotEmpty()
  @IsString()
  surgeon_name: string;

  @IsNotEmpty()
  @IsString()
  hospital_name: string;

  @IsOptional()
  @IsString()
  complications?: string;
}
