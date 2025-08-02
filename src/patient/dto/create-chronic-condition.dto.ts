import { IsString, IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChronicConditionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  diagnosed: string;

  @IsString()
  treating_physician: string;

  @IsDateString()
  last_updated: string;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
