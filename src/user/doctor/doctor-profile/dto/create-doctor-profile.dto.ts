import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, IsNumber, Min } from 'class-validator';

export class CreateDoctorProfileDto {
  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  years_of_experience?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;

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
