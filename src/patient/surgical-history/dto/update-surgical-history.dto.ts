import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateSurgicalHistoryDto {
  @IsOptional()
  @IsString()
  procedure?: string;

  @IsOptional()
  @IsDateString()
  surgery_date?: string;

  @IsOptional()
  @IsString()
  surgeon_name?: string;

  @IsOptional()
  @IsString()
  hospital_name?: string;

  @IsOptional()
  @IsString()
  complications?: string;
}
