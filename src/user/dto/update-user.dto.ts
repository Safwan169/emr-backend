import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class EmergencyContactDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  relationship?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  blood_group?: string;
  height_cm?: number;
  weight_lbs?: number;

  emergency_contact?: EmergencyContactDto;
}
