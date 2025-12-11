/**
 * SpellModule - NestJS module for spell and talent management
 */

import { Module } from '@nestjs/common';
import { SpellService } from './spell.service';
import { TalentService } from './talent.service';

@Module({
  providers: [SpellService, TalentService],
  exports: [SpellService, TalentService],
})
export class SpellModule {}
