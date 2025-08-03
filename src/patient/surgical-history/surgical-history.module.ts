import { Module } from '@nestjs/common';
import { SurgicalHistoryController } from './surgical-history.controller';
import { SurgicalHistoryService } from './surgical-history.service';

@Module({
  controllers: [SurgicalHistoryController],
  providers: [SurgicalHistoryService]
})
export class SurgicalHistoryModule {}
