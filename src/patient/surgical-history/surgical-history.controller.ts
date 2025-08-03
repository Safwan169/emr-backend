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
import { SurgicalHistoryService } from './surgical-history.service';
import { CreateSurgicalHistoryDto } from './dto/create-surgical-history.dto';
import { UpdateSurgicalHistoryDto } from './dto/update-surgical-history.dto';

@Controller('MedicalHistory/Surgical')
export class SurgicalHistoryController {
  constructor(private readonly service: SurgicalHistoryService) {}

  @Post(':user_id')
  @UsePipes(new ValidationPipe())
  create(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Body() dto: CreateSurgicalHistoryDto,
  ) {
    return this.service.create(user_id, dto);
  }

  @Get(':user_id')
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.service.findByUserId(user_id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSurgicalHistoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
