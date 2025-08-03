import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { RoleModule } from './role/role.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DoctorProfileModule } from './user/doctor/doctor-profile/doctor-profile.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    FileUploadModule,
    RoleModule,
    ScheduleModule.forRoot(),
    DoctorProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
