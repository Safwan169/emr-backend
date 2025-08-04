import { DashboardService } from './dashboard.service';
import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('Dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('PreviousPrescription/:UserId')
  async countUserPreviousPrescription(@Param('UserId') UserId: number) {
    return this.service.countByUserId(+UserId);
  }

  @Get('PreviousLabReport/:UserId')
  async countUserPreviousLabReport(@Param('UserId') UserId: number) {
    return this.service.countPreviousLabReport(+UserId);
  }

  @Get('DoctorInfo')
  async getPaginatedDoctorProfiles(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('specialization') specialization?: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    return await this.service.getPaginatedDoctorProfiles(
      pageNumber,
      pageSize,
      specialization,
    );
  }
}
