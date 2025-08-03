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

@Controller('Medical-history/Vaccine')
export class VaccineHistoryController {
  constructor(private readonly service: VaccineHistoryService) {}

  @Post(':user_id')
  @UsePipes(new ValidationPipe())
  create(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Body() dto: CreateVaccineHistoryDto,
  ) {
    return this.service.create(user_id, dto);
  }

  @Get(':user_id')
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.service.findByUserId(user_id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVaccineHistoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
