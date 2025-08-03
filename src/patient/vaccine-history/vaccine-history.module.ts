import { Module } from '@nestjs/common';
import { VaccineHistoryController } from './vaccine-history.controller';
import { VaccineHistoryService } from './vaccine-history.service';

@Module({
  controllers: [VaccineHistoryController],
  providers: [VaccineHistoryService]
})
export class VaccineHistoryModule {}
