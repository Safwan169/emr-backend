import { IsOptional, IsString, IsNumber, IsInt } from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsNumber()
  years_of_experience?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  hospital?: string;

  @IsOptional()
  @IsInt()
  image_file_id?: number;
}
