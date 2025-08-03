import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateVaccineHistoryDto {
  @IsNotEmpty()
  @IsString()
  vaccine_name: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  dose_name: string;

  @IsNotEmpty()
  @IsString()
  vaccine_provider: string;
}
