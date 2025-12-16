import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CharacterModule } from './character/character.module';
import { WorldModule } from './world/world.module';
import { GatewayModule } from './gateway/gateway.module';
import { QuestModule } from './quest/quest.module';
import { ItemModule } from './item/item.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    CharacterModule,
    WorldModule,
    GatewayModule,
    QuestModule,
    ItemModule,
    InventoryModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
