import { Module } from '@nestjs/common';
import { WorldController } from './world.controller';
import { WorldService } from './world.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WorldController],
  providers: [WorldService, PrismaService],
  exports: [WorldService],
})
export class WorldModule {}
