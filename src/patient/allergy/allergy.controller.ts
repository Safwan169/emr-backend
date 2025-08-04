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
  @Post(':UserId')
  create(
    @Param('UserId', ParseIntPipe) UserId: number,
    @Body() dto: CreateAllergyDto,
  ) {
    return this.allergyService.create(UserId, dto);
  }

  // GET /Patient/Allergies/:user_id
  @Get(':UserId')
  findAll(@Param('UserId', ParseIntPipe) UserId: number) {
    return this.allergyService.findAll(UserId);
  }

  // GET /Patient/Allergies/Single/:id
  @Get('Single/:Id')
  findOne(@Param('Id', ParseIntPipe) Id: number) {
    return this.allergyService.findOne(Id);
  }

  // PATCH /Patient/Allergies/:id
  @Put(':Id')
  update(@Param('Id', ParseIntPipe) Id: number, @Body() dto: UpdateAllergyDto) {
    return this.allergyService.update(Id, dto);
  }

  // DELETE /Patient/Allergies/:id
  @Delete(':Id')
  remove(@Param('Id', ParseIntPipe) Id: number) {
    return this.allergyService.remove(Id);
  }
}
