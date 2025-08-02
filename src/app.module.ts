import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { RoleModule } from './role/role.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    FileUploadModule,
    RoleModule,
    ScheduleModule.forRoot(),
    PatientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
