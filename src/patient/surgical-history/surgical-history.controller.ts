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

  @Post(':UserID')
  @UsePipes(new ValidationPipe())
  create(
    @Param('UserID', ParseIntPipe) UserID: number,
    @Body() dto: CreateSurgicalHistoryDto,
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
    @Body() dto: UpdateSurgicalHistoryDto,
  ) {
    return this.service.update(Id, dto);
  }

  @Delete(':Id')
  remove(@Param('Id', ParseIntPipe) Id: number) {
    return this.service.remove(Id);
  }
}
