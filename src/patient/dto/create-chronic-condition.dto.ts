import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateChronicConditionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  diagnosed: string;

  @IsNotEmpty()
  @IsString()
  treating_physician: string;

  @IsNotEmpty()
  @IsDateString()
  last_updated: string;
}


