import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes PrismaService globally available (optional, but recommended)
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
