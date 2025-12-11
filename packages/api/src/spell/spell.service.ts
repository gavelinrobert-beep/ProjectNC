/**
 * SpellService - Server-side spell management
 * Handles spell learning, validation, and execution.
 */

import { Injectable } from '@nestjs/common';
import {
  SpellDefinition,
  SpellRank,
  LearnedSpell,
  SpellBook,
  SpellModifier,
  SpellCastRequest,
  SpellCastResult,
  SpellCastError,
  SpellUnlockType,
  ModifierType,
  getCurrentSpellRank,
  getNextLearnableRank,
  applySpellModifiers,
} from 'shared';

/**
 * SpellService handles all spell-related operations on the server.
 * This includes learning spells, casting validation, and damage calculation.
 */
@Injectable()
export class SpellService {
  // In-memory spell registry (would be loaded from database/files in production)
  private spellRegistry: Map<string, SpellDefinition> = new Map();

  // Player spellbooks (would be stored in database in production)
  private spellBooks: Map<string, SpellBook> = new Map();

  constructor() {
    // Initialize would load spell data from JSON files
    // For now, this is a placeholder
  }

  /**
   * Register a spell definition in the registry.
   */
  registerSpell(spell: SpellDefinition): void {
    this.spellRegistry.set(spell.id, spell);
  }

  /**
   * Register multiple spell definitions.
   */
  registerSpells(spells: SpellDefinition[]): void {
    for (const spell of spells) {
      this.registerSpell(spell);
    }
  }

  /**
   * Get a spell definition by ID.
   */
  getSpellDefinition(spellId: string): SpellDefinition | undefined {
    return this.spellRegistry.get(spellId);
  }

  /**
   * Get all registered spells.
   */
  getAllSpells(): SpellDefinition[] {
    return Array.from(this.spellRegistry.values());
  }

  /**
   * Get spells available for a specific class.
   */
  getSpellsForClass(characterClass: string): SpellDefinition[] {
    return this.getAllSpells().filter((spell) =>
      spell.allowedClasses.includes(characterClass as any),
    );
  }

  /**
   * Get or create a spellbook for a character.
   */
  getSpellBook(characterId: string): SpellBook {
    let book = this.spellBooks.get(characterId);
    if (!book) {
      book = {
        characterId,
        spells: [],
        updatedAt: new Date(),
      };
      this.spellBooks.set(characterId, book);
    }
    return book;
  }

  /**
   * Check if a character knows a specific spell.
   */
  knowsSpell(characterId: string, spellId: string): boolean {
    const book = this.getSpellBook(characterId);
    return book.spells.some((s) => s.spellId === spellId);
  }

  /**
   * Get a learned spell for a character.
   */
  getLearnedSpell(characterId: string, spellId: string): LearnedSpell | undefined {
    const book = this.getSpellBook(characterId);
    return book.spells.find((s) => s.spellId === spellId);
  }

  /**
   * Learn a new spell or upgrade an existing rank.
   */
  learnSpell(
    characterId: string,
    spellId: string,
    characterLevel: number,
    characterClass: string,
    unlockType: SpellUnlockType,
    metadata?: {
      questId?: string;
      talentId?: string;
      trainerId?: string;
    },
  ): { success: boolean; error?: string; newRank?: number } {
    const spell = this.getSpellDefinition(spellId);
    if (!spell) {
      return { success: false, error: 'Spell not found' };
    }

    // Validate class
    if (!spell.allowedClasses.includes(characterClass as any)) {
      return { success: false, error: 'Class cannot learn this spell' };
    }

    // Check unlock requirements
    const requirementMet = this.checkUnlockRequirement(
      spell,
      characterLevel,
      unlockType,
      metadata,
    );
    if (!requirementMet.met) {
      return { success: false, error: requirementMet.reason };
    }

    const book = this.getSpellBook(characterId);
    const existingSpell = book.spells.find((s) => s.spellId === spellId);
    const currentRank = existingSpell?.maxRankLearned ?? 0;

    // Find next available rank
    const nextRank = getNextLearnableRank(spell, existingSpell ?? null, characterLevel);
    if (!nextRank) {
      return {
        success: false,
        error: currentRank >= spell.ranks.length
          ? 'Already at maximum rank'
          : 'Level too low for next rank',
      };
    }

    // Update or add spell
    if (existingSpell) {
      existingSpell.maxRankLearned = nextRank.rank;
    } else {
      book.spells.push({
        spellId,
        maxRankLearned: nextRank.rank,
        learnedAt: new Date(),
        learnedFrom: unlockType,
      });
    }

    book.updatedAt = new Date();
    return { success: true, newRank: nextRank.rank };
  }

  /**
   * Check if unlock requirements are met.
   */
  private checkUnlockRequirement(
    spell: SpellDefinition,
    characterLevel: number,
    unlockType: SpellUnlockType,
    metadata?: { questId?: string; talentId?: string },
  ): { met: boolean; reason?: string } {
    const req = spell.unlockRequirement;

    switch (req.type) {
      case SpellUnlockType.LEVEL:
        if (characterLevel < (req.levelRequired ?? 0)) {
          return { met: false, reason: `Requires level ${req.levelRequired}` };
        }
        break;

      case SpellUnlockType.QUEST:
        if (unlockType !== SpellUnlockType.QUEST || metadata?.questId !== req.questId) {
          return { met: false, reason: 'Requires completing a specific quest' };
        }
        break;

      case SpellUnlockType.TALENT:
        if (unlockType !== SpellUnlockType.TALENT || metadata?.talentId !== req.talentId) {
          return { met: false, reason: 'Requires learning a specific talent' };
        }
        break;

      case SpellUnlockType.TRAINER:
        // Would validate trainer interaction
        break;

      case SpellUnlockType.ITEM:
        // Would validate item consumption
        break;
    }

    return { met: true };
  }

  /**
   * Validate a spell cast request.
   */
  validateCast(
    characterId: string,
    request: SpellCastRequest,
    characterState: CharacterState,
    targetState?: EntityState,
    cooldowns?: Map<string, number>,
    modifiers?: SpellModifier[],
  ): SpellCastResult {
    const spell = this.getSpellDefinition(request.spellId);
    if (!spell) {
      return { success: false, errorCode: SpellCastError.NOT_LEARNED, errorMessage: 'Unknown spell' };
    }

    // Check if known
    const learnedSpell = this.getLearnedSpell(characterId, request.spellId);
    if (!learnedSpell) {
      return { success: false, errorCode: SpellCastError.NOT_LEARNED, errorMessage: 'Spell not learned' };
    }

    // Get current rank
    const rank = getCurrentSpellRank(spell, learnedSpell);
    if (!rank) {
      return { success: false, errorCode: SpellCastError.NOT_LEARNED, errorMessage: 'Invalid spell rank' };
    }

    // Check cooldown
    if (cooldowns) {
      const cdExpiry = cooldowns.get(request.spellId);
      if (cdExpiry && request.timestamp < cdExpiry) {
        return { success: false, errorCode: SpellCastError.ON_COOLDOWN, errorMessage: 'Spell on cooldown' };
      }
    }

    // Calculate modified mana cost
    let manaCost = rank.resourceCost;
    if (modifiers) {
      manaCost = applySpellModifiers(manaCost, modifiers, ModifierType.MANA_COST);
    }

    // Check mana
    if (characterState.currentMana < manaCost) {
      return { success: false, errorCode: SpellCastError.NOT_ENOUGH_MANA, errorMessage: 'Not enough mana' };
    }

    // Check if silenced
    if (characterState.isSilenced) {
      return { success: false, errorCode: SpellCastError.SILENCED, errorMessage: 'Cannot cast while silenced' };
    }

    // Check movement for non-instant casts
    if (!spell.castWhileMoving && characterState.isMoving && rank.castTime > 0) {
      return { success: false, errorCode: SpellCastError.MOVING, errorMessage: 'Cannot cast while moving' };
    }

    // Check already casting
    if (characterState.isCasting) {
      return { success: false, errorCode: SpellCastError.ALREADY_CASTING, errorMessage: 'Already casting' };
    }

    // Validate target
    if (spell.targetType !== 'SELF' && spell.targetType !== 'GROUND') {
      if (!targetState) {
        return { success: false, errorCode: SpellCastError.INVALID_TARGET, errorMessage: 'No target' };
      }

      if (targetState.isDead) {
        return { success: false, errorCode: SpellCastError.TARGET_DEAD, errorMessage: 'Target is dead' };
      }

      // Calculate modified range
      let maxRange = rank.range;
      if (modifiers) {
        maxRange = applySpellModifiers(maxRange, modifiers, ModifierType.RANGE);
      }

      // Check range
      const distance = this.calculateDistance(characterState.position, targetState.position);
      if (distance > maxRange) {
        return { success: false, errorCode: SpellCastError.OUT_OF_RANGE, errorMessage: 'Target out of range' };
      }
    }

    // Calculate modified cast time
    let castTime = rank.castTime;
    if (modifiers) {
      castTime = applySpellModifiers(castTime, modifiers, ModifierType.CAST_TIME);
      if (castTime < 0) castTime = 0;
    }

    return {
      success: true,
      castStartTime: request.timestamp,
      castEndTime: request.timestamp + castTime,
    };
  }

  /**
   * Calculate damage for a spell cast.
   */
  calculateSpellDamage(
    spell: SpellDefinition,
    rank: SpellRank,
    characterStats: CharacterCombatStats,
    modifiers: SpellModifier[],
    isCrit: boolean,
  ): number {
    let totalDamage = 0;

    for (const effect of rank.effects) {
      if (effect.type === 'DAMAGE') {
        let damage = effect.baseValue;

        // Add spell power scaling
        damage += characterStats.spellPower * effect.spellPowerCoefficient;

        // Add attack power scaling (for physical)
        damage += characterStats.attackPower * effect.attackPowerCoefficient;

        // Apply modifiers
        damage = applySpellModifiers(damage, modifiers, ModifierType.DAMAGE);

        // Apply crit
        if (isCrit) {
          let critMultiplier = 1.5; // Base 150% crit damage
          critMultiplier = applySpellModifiers(critMultiplier, modifiers, ModifierType.CRIT_DAMAGE);
          damage *= critMultiplier;
        }

        totalDamage += damage;
      }
    }

    return Math.round(totalDamage);
  }

  /**
   * Calculate healing for a spell cast.
   */
  calculateSpellHealing(
    spell: SpellDefinition,
    rank: SpellRank,
    characterStats: CharacterCombatStats,
    modifiers: SpellModifier[],
    isCrit: boolean,
  ): number {
    let totalHealing = 0;

    for (const effect of rank.effects) {
      if (effect.type === 'HEAL') {
        let healing = effect.baseValue;

        // Add spell power scaling
        healing += characterStats.spellPower * effect.spellPowerCoefficient;

        // Apply modifiers
        healing = applySpellModifiers(healing, modifiers, ModifierType.HEALING);

        // Apply crit
        if (isCrit) {
          healing *= 1.5;
        }

        totalHealing += healing;
      }
    }

    return Math.round(totalHealing);
  }

  /**
   * Check if a spell crits.
   */
  checkCrit(baseChance: number, modifiers: SpellModifier[]): boolean {
    const critChance = applySpellModifiers(baseChance, modifiers, ModifierType.CRIT_CHANCE);
    return Math.random() * 100 < critChance;
  }

  /**
   * Calculate distance between two positions.
   */
  private calculateDistance(
    pos1: { x: number; y: number; z: number },
    pos2: { x: number; y: number; z: number },
  ): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

/**
 * Character state for cast validation.
 */
interface CharacterState {
  currentMana: number;
  maxMana: number;
  isMoving: boolean;
  isCasting: boolean;
  isSilenced: boolean;
  position: { x: number; y: number; z: number };
}

/**
 * Entity state for target validation.
 */
interface EntityState {
  entityId: string;
  isDead: boolean;
  position: { x: number; y: number; z: number };
  faction?: string;
}

/**
 * Character combat stats for damage calculation.
 */
interface CharacterCombatStats {
  spellPower: number;
  attackPower: number;
  critChance: number;
}
