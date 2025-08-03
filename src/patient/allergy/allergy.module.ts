import { Module } from '@nestjs/common';
import { AllergyService } from './allergy.service';
import { AllergyController } from './allergy.controller';

@Module({
  providers: [AllergyService],
  controllers: [AllergyController]
})
export class AllergyModule {}
