import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCharacterDto } from './dto/character.dto';

/**
 * CharacterService - Handles character creation, loading, and management
 */
@Injectable()
export class CharacterService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all characters for an account
   */
  async getCharactersByAccount(accountId: string) {
    const characters = await this.prisma.character.findMany({
      where: { accountId },
      orderBy: { lastLogin: 'desc' },
    });

    return characters;
  }

  /**
   * Get a single character by ID
   */
  async getCharacterById(characterId: string, accountId: string) {
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    // Verify ownership
    if (character.accountId !== accountId) {
      throw new ForbiddenException('You do not own this character');
    }

    return character;
  }

  /**
   * Create a new character
   */
  async createCharacter(accountId: string, dto: CreateCharacterDto) {
    // Check if name is already taken
    const existingCharacter = await this.prisma.character.findUnique({
      where: { name: dto.name },
    });

    if (existingCharacter) {
      throw new ConflictException('Character name already taken');
    }

    // Calculate base stats based on race and class
    const baseStats = this.calculateBaseStats(dto.race, dto.class);

    // Create character
    const character = await this.prisma.character.create({
      data: {
        accountId,
        name: dto.name,
        race: dto.race,
        class: dto.class,
        ...baseStats,
      },
    });

    return character;
  }

  /**
   * Delete a character
   */
  async deleteCharacter(characterId: string, accountId: string) {
    const character = await this.getCharacterById(characterId, accountId);

    await this.prisma.character.delete({
      where: { id: character.id },
    });

    return { message: 'Character deleted successfully' };
  }

  /**
   * Update character's last login time
   */
  async updateLastLogin(characterId: string) {
    await this.prisma.character.update({
      where: { id: characterId },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Calculate base stats based on race and class
   * This is a simplified version - can be expanded with more complex formulas
   */
  private calculateBaseStats(race: string, characterClass: string) {
    // Base stats for all characters
    let strength = 10;
    let agility = 10;
    let intellect = 10;
    let stamina = 10;
    let spirit = 10;

    // Race bonuses
    switch (race) {
      case 'HUMAN':
        spirit += 2;
        stamina += 1;
        break;
      case 'ELF':
        agility += 3;
        intellect += 2;
        break;
      case 'DWARF':
        stamina += 3;
        strength += 2;
        break;
      case 'ORC':
        strength += 4;
        stamina += 2;
        break;
    }

    // Class bonuses
    switch (characterClass) {
      case 'WARRIOR':
        strength += 5;
        stamina += 3;
        break;
      case 'MAGE':
        intellect += 6;
        spirit += 4;
        break;
      case 'ROGUE':
        agility += 6;
        strength += 2;
        break;
      case 'PRIEST':
        intellect += 4;
        spirit += 6;
        break;
    }

    // Calculate health and mana based on stats
    const maxHealth = 50 + (stamina * 10);
    const maxMana = 0 + (intellect * 15);

    return {
      strength,
      agility,
      intellect,
      stamina,
      spirit,
      maxHealth,
      maxMana,
      currentHealth: maxHealth,
      currentMana: maxMana,
    };
  }
}
