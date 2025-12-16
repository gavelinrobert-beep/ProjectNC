import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Get()
  async getItemDefinitions(
    @Query('type') type?: string,
    @Query('rarity') rarity?: string,
  ) {
    if (type) {
      return this.itemService.getItemsByType(type);
    }
    if (rarity) {
      return this.itemService.getItemsByRarity(rarity);
    }
    return this.itemService.getItemDefinitions();
  }

  @Get(':itemId')
  async getItemDefinitionById(@Param('itemId') itemId: string) {
    return this.itemService.getItemDefinitionById(itemId);
  }
}
