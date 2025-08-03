import { DashboardService } from './dashboard.service';
import { Controller, Get, Param,Query } from '@nestjs/common';

@Controller('Dashboard')
export class DashboardController {
    constructor(private readonly service: DashboardService) {}

    @Get('PreviousPrescription/:user_id')
    async countUserPreviousPrescription(@Param('user_id')userId:number){
        return this.service.countByUserId(+userId);
    }

    @Get('PreviousLabReport/:user_id')
    async countUserPreviousLabReport(@Param('user_id')userId:number){
        return this.service.countPreviousLabReport(+userId);
    }

  @Get('DoctorInfo')
  async getPaginatedDoctorProfiles(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('specialization') specialization?: string, // 👈 optional filter
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
