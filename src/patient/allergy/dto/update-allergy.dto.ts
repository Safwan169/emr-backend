// src/patient/allergy/dto/update-allergy.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AllergyCondition, AllergyStatus } from '@prisma/client';

export class UpdateAllergyDto {
  @IsOptional()
  @IsString()
  allergy_name?: string;

  @IsOptional()
  @IsString()
  allergy_type?: string;

  @IsOptional()
  @IsEnum(AllergyCondition, {
    message: 'Condition must be one of: Mild, Moderate, Severe',
  })
  condition?: AllergyCondition;

  @IsOptional()
  @IsString()
  reactions?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(AllergyStatus, {
    message: 'Status must be either active or inactive',
  })
  status?: AllergyStatus;
}
