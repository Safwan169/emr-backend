import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SurgicalHistoryService } from './surgical-history.service';
import { CreateSurgicalHistoryDto } from './dto/create-surgical-history.dto';
import { UpdateSurgicalHistoryDto } from './dto/update-surgical-history.dto';

@Controller('Patient/Medical-History')
export class SurgicalHistoryController {
  constructor(private readonly surgicalHistoryService: SurgicalHistoryService) {}

  @Post('Surgical')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateSurgicalHistoryDto) {
    return this.surgicalHistoryService.create(dto);
  }

  @Get('Surgical')
  findAll() {
    return this.surgicalHistoryService.findAll();
  }

  @Put('Surgical/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSurgicalHistoryDto,
  ) {
    return this.surgicalHistoryService.update(id, dto);
  }

  @Delete('Surgical/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.surgicalHistoryService.remove(id);
  }
}
