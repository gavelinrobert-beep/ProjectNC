import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CharacterModule } from './character/character.module';
import { WorldModule } from './world/world.module';
import { GatewayModule } from './gateway/gateway.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    CharacterModule,
    WorldModule,
    GatewayModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
