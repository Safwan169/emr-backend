// src/patient/previous-lab-report/dto/create-previous-lab-report.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class CreatePreviousLabReportDto {
  @IsOptional()
  @IsString()
  description?: string;
}
