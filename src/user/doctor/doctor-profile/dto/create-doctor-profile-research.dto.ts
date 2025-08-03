import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreateDoctorResearchDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  research_name?: string;

  @IsOptional()
  @IsInt()
  publication_year?: number;

  @IsOptional()
  @IsString()
  published_by?: string;
}
