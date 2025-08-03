import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDoctorEducationDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  achievement?: string;

  @IsOptional()
  @IsString()
  timeline?: string;
}
