import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreateDoctorCertificationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  certified_year?: number;

  @IsOptional()
  @IsInt()
  validation_year?: number;

  @IsOptional()
  @IsString()
  institution?: string;
}
