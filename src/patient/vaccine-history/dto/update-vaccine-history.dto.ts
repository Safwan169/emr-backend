import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateVaccineHistoryDto {
  @IsOptional()
  @IsString()
  vaccine_name?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  dose_name?: string;

  @IsOptional()
  @IsString()
  vaccine_provider?: string;
}
