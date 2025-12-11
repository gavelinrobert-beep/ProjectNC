import { Module } from '@nestjs/common';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CharacterController],
  providers: [CharacterService, PrismaService],
  exports: [CharacterService],
})
export class CharacterModule {}
