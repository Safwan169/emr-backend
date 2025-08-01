import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 10, { message: 'Password must be between 6 and 10 characters' })
  password: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Date of birth must be a valid ISO 8601 date string' },
  )
  date_of_birth?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'], {
    message: 'Gender must be male, female, or other',
  })
  gender?: string;
}
