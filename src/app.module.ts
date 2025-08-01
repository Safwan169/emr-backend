import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, FileUploadModule, RoleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
