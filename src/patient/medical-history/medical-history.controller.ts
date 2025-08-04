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

@Controller('MedicalHistory/Chronic')
export class MedicalHistoryController {
  constructor(private readonly service: MedicalHistoryService) {}

  @Post(':UserId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateChronicConditionDto,
  ) {
    return this.service.create(UserId, dto);
  }

  @Get(':UserId')
  getByUser(@Param('UserId', ParseIntPipe) UserId: number) {
    return this.service.findByUserId(UserId);
  }

  @Put(':Id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('Id', ParseIntPipe) Id: number,
    @Body() dto: UpdateChronicConditionDto,
  ) {
    return this.service.update(Id, dto);
  }

  @Delete(':Id')
  remove(@Param('Id', ParseIntPipe) Id: number) {
    return this.service.remove(Id);
  }
}
