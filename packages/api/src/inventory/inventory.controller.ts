import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get(':characterId')
  async getInventory(@Param('characterId') characterId: string) {
    return this.inventoryService.getInventory(characterId);
  }

  @Post('add')
  async addItem(
    @Body() body: { characterId: string; itemDefinitionId: string; quantity: number },
  ) {
    return this.inventoryService.addItem(body);
  }

  @Delete(':inventoryItemId')
  async removeItem(@Param('inventoryItemId') inventoryItemId: string) {
    return this.inventoryService.removeItem(inventoryItemId);
  }

  @Post('move')
  async moveItem(
    @Body() body: { characterId: string; inventoryItemId: string; newSlot: number },
  ) {
    return this.inventoryService.moveItem(body);
  }

  @Post('equip')
  async equipItem(
    @Body() body: { characterId: string; inventoryItemId: string; slot: number },
  ) {
    return this.inventoryService.equipItem(body);
  }

  @Post('unequip')
  async unequipItem(
    @Body() body: { characterId: string; inventoryItemId: string },
  ) {
    return this.inventoryService.unequipItem(body.characterId, body.inventoryItemId);
  }
}
