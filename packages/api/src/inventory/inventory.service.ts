import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AddItemDto {
  characterId: string;
  itemDefinitionId: string;
  quantity: number;
}

interface EquipItemDto {
  characterId: string;
  inventoryItemId: string;
  slot: number;
}

interface MoveItemDto {
  characterId: string;
  inventoryItemId: string;
  newSlot: number;
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get character's inventory
   */
  async getInventory(characterId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { characterId },
      orderBy: { slot: 'asc' },
    });
  }

  /**
   * Add an item to character's inventory
   */
  async addItem(dto: AddItemDto) {
    const { characterId, itemDefinitionId, quantity } = dto;

    // Verify character exists
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException(`Character ${characterId} not found`);
    }

    // Get item definition
    const itemDef = await this.prisma.itemDefinition.findUnique({
      where: { id: itemDefinitionId },
    });

    if (!itemDef) {
      throw new NotFoundException(`Item ${itemDefinitionId} not found`);
    }

    // Check if item is stackable
    if (itemDef.maxStack > 1) {
      // Try to find existing stack with room
      const existingItem = await this.prisma.inventoryItem.findFirst({
        where: {
          characterId,
          itemDefinitionId,
          quantity: { lt: itemDef.maxStack },
          slot: { gte: 0 }, // Only bag slots, not equipment
        },
      });

      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          itemDef.maxStack,
        );
        const remaining = existingItem.quantity + quantity - newQuantity;

        await this.prisma.inventoryItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });

        // If still items remaining, recursively add them
        if (remaining > 0) {
          return this.addItem({ characterId, itemDefinitionId, quantity: remaining });
        }

        return existingItem;
      }
    }

    // Find first available slot (0-39 are bag slots)
    const usedSlots = await this.prisma.inventoryItem.findMany({
      where: { characterId, slot: { gte: 0, lt: 40 } },
      select: { slot: true },
    });

    const usedSlotNumbers = new Set(usedSlots.map((item) => item.slot));
    let availableSlot = -1;

    for (let i = 0; i < 40; i++) {
      if (!usedSlotNumbers.has(i)) {
        availableSlot = i;
        break;
      }
    }

    if (availableSlot === -1) {
      throw new BadRequestException('Inventory is full');
    }

    // Create new inventory item
    return this.prisma.inventoryItem.create({
      data: {
        characterId,
        itemDefinitionId,
        quantity: Math.min(quantity, itemDef.maxStack),
        slot: availableSlot,
      },
    });
  }

  /**
   * Remove an item from inventory
   */
  async removeItem(inventoryItemId: string) {
    return this.prisma.inventoryItem.delete({
      where: { id: inventoryItemId },
    });
  }

  /**
   * Move item to a different slot
   */
  async moveItem(dto: MoveItemDto) {
    const { characterId, inventoryItemId, newSlot } = dto;

    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item || item.characterId !== characterId) {
      throw new NotFoundException('Item not found');
    }

    // Check if target slot is occupied
    const targetSlotItem = await this.prisma.inventoryItem.findUnique({
      where: {
        characterId_slot: { characterId, slot: newSlot },
      },
    });

    if (targetSlotItem) {
      // Swap items
      const tempSlot = -9999; // Temporary slot for swapping
      await this.prisma.inventoryItem.update({
        where: { id: targetSlotItem.id },
        data: { slot: tempSlot },
      });

      await this.prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { slot: newSlot },
      });

      await this.prisma.inventoryItem.update({
        where: { id: targetSlotItem.id },
        data: { slot: item.slot },
      });
    } else {
      // Just move to empty slot
      await this.prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { slot: newSlot },
      });
    }

    return this.getInventory(characterId);
  }

  /**
   * Equip an item to an equipment slot
   */
  async equipItem(dto: EquipItemDto) {
    const { characterId, inventoryItemId, slot } = dto;

    // Equipment slots are negative numbers: -1 to -10
    if (slot >= 0) {
      throw new BadRequestException('Equipment slots must be negative');
    }

    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item || item.characterId !== characterId) {
      throw new NotFoundException('Item not found');
    }

    const itemDef = await this.prisma.itemDefinition.findUnique({
      where: { id: item.itemDefinitionId },
    });

    if (!itemDef || !itemDef.slot) {
      throw new BadRequestException('Item is not equippable');
    }

    // Check if slot is already occupied
    const equippedItem = await this.prisma.inventoryItem.findUnique({
      where: {
        characterId_slot: { characterId, slot },
      },
    });

    if (equippedItem) {
      // Unequip current item first
      await this.moveItem({
        characterId,
        inventoryItemId: equippedItem.id,
        newSlot: item.slot, // Swap positions
      });
    }

    // Equip the item
    await this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { slot },
    });

    return this.getInventory(characterId);
  }

  /**
   * Unequip an item
   */
  async unequipItem(characterId: string, inventoryItemId: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item || item.characterId !== characterId) {
      throw new NotFoundException('Item not found');
    }

    if (item.slot >= 0) {
      throw new BadRequestException('Item is not equipped');
    }

    // Find first available bag slot
    const usedSlots = await this.prisma.inventoryItem.findMany({
      where: { characterId, slot: { gte: 0, lt: 40 } },
      select: { slot: true },
    });

    const usedSlotNumbers = new Set(usedSlots.map((i) => i.slot));
    let availableSlot = -1;

    for (let i = 0; i < 40; i++) {
      if (!usedSlotNumbers.has(i)) {
        availableSlot = i;
        break;
      }
    }

    if (availableSlot === -1) {
      throw new BadRequestException('Inventory is full');
    }

    await this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { slot: availableSlot },
    });

    return this.getInventory(characterId);
  }
}
