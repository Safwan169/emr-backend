import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module'; // Adjust relative path if needed
import { ScheduleModule } from '@nestjs/schedule';
import { DoctorProfileModule } from './doctor/doctor-profile/doctor-profile.module';

@Module({
  imports: [PrismaModule, ScheduleModule, DoctorProfileModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
