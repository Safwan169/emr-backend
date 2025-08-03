import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AllergyCondition, AllergyStatus } from '@prisma/client';

export class CreateAllergyDto {
  @IsString()
  @IsNotEmpty()
  allergy_name: string;

  @IsString()
  @IsNotEmpty()
  allergy_type: string;

  @IsEnum(AllergyCondition)
  condition: AllergyCondition;

  @IsString()
  @IsNotEmpty()
  reactions: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(AllergyStatus)
  @IsOptional()
  status?: AllergyStatus;
}
