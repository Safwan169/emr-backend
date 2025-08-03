import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateChronicConditionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  diagnosed?: string;

  @IsOptional()
  @IsString()
  treating_physician?: string;

  @IsOptional()
  @IsDateString()
  last_updated?: string;
}
