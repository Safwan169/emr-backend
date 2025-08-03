import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { AllergyService } from './allergy.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Controller('Patient/Allergies')
export class AllergyController {
  constructor(private readonly allergyService: AllergyService) {}

  // POST /Patient/Allergies/:user_id
  @Post(':user_id')
  create(
    @Param('user_id', ParseIntPipe) userId: number,
    @Body() dto: CreateAllergyDto,
  ) {
    return this.allergyService.create(userId, dto);
  }

  // GET /Patient/Allergies/:user_id
  @Get(':user_id')
  findAll(@Param('user_id', ParseIntPipe) userId: number) {
    return this.allergyService.findAll(userId);
  }

  // GET /Patient/Allergies/Single/:id
  @Get('Single/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.allergyService.findOne(id);
  }

  // PATCH /Patient/Allergies/:id
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAllergyDto,
  ) {
    return this.allergyService.update(id, dto);
  }

  // DELETE /Patient/Allergies/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.allergyService.remove(id);
  }
}
