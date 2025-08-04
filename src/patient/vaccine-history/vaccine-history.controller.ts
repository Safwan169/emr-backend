import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VaccineHistoryService } from './vaccine-history.service';
import { CreateVaccineHistoryDto } from './dto/create-vaccine-history.dto';
import { UpdateVaccineHistoryDto } from './dto/update-vaccine-history.dto';

@Controller('MedicalHistory/Vaccine')
export class VaccineHistoryController {
  constructor(private readonly service: VaccineHistoryService) {}

  @Post(':UserID')
  @UsePipes(new ValidationPipe())
  create(
    @Param('UserID', ParseIntPipe) UserID: number,
    @Body() dto: CreateVaccineHistoryDto,
  ) {
    return this.service.create(UserID, dto);
  }

  @Get(':UserID')
  findByUser(@Param('UserID', ParseIntPipe) UserID: number) {
    return this.service.findByUserId(UserID);
  }

  @Put(':Id')
  @UsePipes(new ValidationPipe())
  update(
    @Param('Id', ParseIntPipe) Id: number,
    @Body() dto: UpdateVaccineHistoryDto,
  ) {
    return this.service.update(Id, dto);
  }

  @Delete(':Id')
  remove(@Param('Id', ParseIntPipe) Id: number) {
    return this.service.remove(Id);
  }
}
