import {
  IsArray,
  IsString,
  IsNotEmpty,
  ArrayNotEmpty,
  IsIn,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';

const Weekdays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export class CreateDoctorAvailabilityDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one weekday must be selected' })
  @IsIn(Weekdays, {
    each: true,
    message: 'Invalid weekday. Valid options: ' + Weekdays.join(', '),
  })
  weekdays: string[];

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:mm format (24-hour)',
  })
  start_time: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:mm format (24-hour)',
  })
  end_time: string;

  @IsInt()
  @Min(5, { message: 'Slot duration must be at least 5 minutes' })
  @Max(240, { message: 'Slot duration cannot exceed 4 hours (240 minutes)' })
  slot_duration_minutes: number;
}
