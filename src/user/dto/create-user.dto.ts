import {
  IsEmail,
  IsNotEmpty,
  IsDateString,
  Length,
  IsIn,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First name is required' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  last_name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsDateString(
    {},
    { message: 'Date of birth must be a valid ISO date string' },
  )
  date_of_birth: string;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsIn(['male', 'female', 'other'], {
    message: 'Gender must be male, female, or other',
  })
  gender: string;

  @IsNotEmpty({ message: 'Role ID is required' })
  @IsInt({ message: 'Role ID must be an integer' })
  role_id: number;
}
