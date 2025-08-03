import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateChronicConditionDto } from '../dto/create-chronic-condition.dto';
import { UpdateChronicConditionDto } from '../../patient/dto/update-chronic-condition.dto';

@Controller('Medical-history/Chronic')
export class MedicalHistoryController {
  constructor(private readonly service: MedicalHistoryService) {}

  @Post(':userId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateChronicConditionDto,
  ) {
    return this.service.create(userId, dto);
  }

  @Get(':userId')
  getByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findByUserId(userId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChronicConditionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
