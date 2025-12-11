import { Controller, Get, Param, Query } from '@nestjs/common';
import { WorldService } from './world.service';

/**
 * WorldController - Static world data endpoints
 */
@Controller('world')
export class WorldController {
  constructor(private worldService: WorldService) {}

  /**
   * GET /api/world/zones
   * Get all zones
   */
  @Get('zones')
  async getZones() {
    return this.worldService.getZones();
  }

  /**
   * GET /api/world/zones/:id
   * Get a specific zone
   */
  @Get('zones/:id')
  async getZone(@Param('id') id: string) {
    return this.worldService.getZoneById(id);
  }

  /**
   * GET /api/world/zones/:id/npcs
   * Get NPCs in a zone
   */
  @Get('zones/:id/npcs')
  async getZoneNPCs(@Param('id') zoneId: string) {
    return this.worldService.getNPCsByZone(zoneId);
  }

  /**
   * GET /api/world/abilities
   * Get all abilities (optionally filtered by class)
   */
  @Get('abilities')
  async getAbilities(@Query('class') classFilter?: string) {
    return this.worldService.getAbilities(classFilter);
  }

  /**
   * GET /api/world/items
   * Get item definitions
   */
  @Get('items')
  async getItems() {
    return this.worldService.getItemDefinitions();
  }
}
