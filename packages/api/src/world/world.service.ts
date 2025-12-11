import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * WorldService - Provides zone metadata and static world data
 * This data is used by the frontend to know about available zones
 * The actual real-time gameplay happens in the Game Server (Go)
 */
@Injectable()
export class WorldService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all zones
   */
  async getZones() {
    return this.prisma.zone.findMany();
  }

  /**
   * Get a specific zone by ID
   */
  async getZoneById(zoneId: string) {
    return this.prisma.zone.findUnique({
      where: { id: zoneId },
    });
  }

  /**
   * Get NPCs in a zone
   */
  async getNPCsByZone(zoneId: string) {
    return this.prisma.nPC.findMany({
      where: { zoneId },
    });
  }

  /**
   * Get all abilities
   */
  async getAbilities(classFilter?: string) {
    return this.prisma.ability.findMany({
      where: classFilter ? {
        OR: [
          { classRequired: classFilter },
          { classRequired: 'ALL' },
        ],
      } : undefined,
    });
  }

  /**
   * Get item definitions (for tooltips, crafting, etc.)
   */
  async getItemDefinitions() {
    return this.prisma.itemDefinition.findMany();
  }
}
