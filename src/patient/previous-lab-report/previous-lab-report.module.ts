import { Module } from '@nestjs/common';
import { PreviousLabReportController } from './previous-lab-report.controller';
import { PreviousLabReportService } from './previous-lab-report.service';

@Module({
  controllers: [PreviousLabReportController],
  providers: [PreviousLabReportService]
})
export class PreviousLabReportModule {}
