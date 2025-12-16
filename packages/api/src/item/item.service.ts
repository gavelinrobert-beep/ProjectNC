import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all item definitions
   */
  async getItemDefinitions() {
    return this.prisma.itemDefinition.findMany();
  }

  /**
   * Get item definition by ID
   */
  async getItemDefinitionById(itemId: string) {
    const item = await this.prisma.itemDefinition.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    return item;
  }

  /**
   * Get items by type
   */
  async getItemsByType(type: string) {
    return this.prisma.itemDefinition.findMany({
      where: { type },
    });
  }

  /**
   * Get items by rarity
   */
  async getItemsByRarity(rarity: string) {
    return this.prisma.itemDefinition.findMany({
      where: { rarity },
    });
  }
}
