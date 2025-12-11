/**
 * Spell Definition Types
 * Core spell system interfaces and types.
 */

import { Class } from '../enums';
import {
  SpellSchool,
  SpellType,
  TargetType,
  CastType,
  SpellUnlockType,
  ResourceType,
  ModifierType,
  ModifierOperation,
} from './enums';

/**
 * SpellEffect represents a single effect that a spell can apply.
 * Spells can have multiple effects (e.g., damage + apply debuff).
 */
export interface SpellEffect {
  /** Unique identifier for this effect */
  id: string;

  /** Type of effect */
  type: 'DAMAGE' | 'HEAL' | 'APPLY_BUFF' | 'APPLY_DEBUFF' | 'DISPEL' | 'KNOCKBACK' | 'STUN' | 'SLOW' | 'SILENCE';

  /** Magical school (for resistance calculations) */
  school: SpellSchool;

  /** Base value (damage, healing amount, etc.) */
  baseValue: number;

  /** Scaling coefficient with spell power */
  spellPowerCoefficient: number;

  /** Scaling coefficient with attack power (for physical) */
  attackPowerCoefficient: number;

  /** Duration in milliseconds (for buffs/debuffs) */
  duration?: number;

  /** Tick interval for DoTs/HoTs */
  tickInterval?: number;

  /** Buff/Debuff ID to apply */
  auraId?: string;
}

/**
 * SpellRank represents a specific rank of a spell.
 * Higher ranks typically have increased effects and costs.
 */
export interface SpellRank {
  /** Rank number (1, 2, 3, etc.) */
  rank: number;

  /** Minimum level to learn this rank */
  levelRequired: number;

  /** Resource cost */
  resourceCost: number;

  /** Resource type (mana, rage, etc.) */
  resourceType: ResourceType;

  /** Cast time in milliseconds (0 for instant) */
  castTime: number;

  /** Cooldown in milliseconds */
  cooldown: number;

  /** Global cooldown in milliseconds */
  globalCooldown: number;

  /** Range in yards */
  range: number;

  /** Effects at this rank */
  effects: SpellEffect[];

  /** Training cost in gold (copper units) */
  trainingCost: number;

  /** Tooltip description for this rank */
  tooltip: string;
}

/**
 * SpellUnlockRequirement defines how a spell is unlocked.
 */
export interface SpellUnlockRequirement {
  /** Type of unlock */
  type: SpellUnlockType;

  /** Level required (for LEVEL type) */
  levelRequired?: number;

  /** Quest ID required (for QUEST type) */
  questId?: string;

  /** Talent ID required (for TALENT type) */
  talentId?: string;

  /** Item ID required (for ITEM type) */
  itemId?: string;
}

/**
 * SpellDefinition is the complete definition of a spell.
 * This is static data that doesn't change per character.
 */
export interface SpellDefinition {
  /** Unique spell identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description of the spell */
  description: string;

  /** Icon asset path */
  icon: string;

  /** Spell school (fire, frost, etc.) */
  school: SpellSchool;

  /** Spell type (damage, heal, etc.) */
  type: SpellType;

  /** Valid target types */
  targetType: TargetType;

  /** How the spell is cast */
  castType: CastType;

  /** Classes that can learn this spell */
  allowedClasses: Class[];

  /** How to unlock the base spell */
  unlockRequirement: SpellUnlockRequirement;

  /** All available ranks of this spell */
  ranks: SpellRank[];

  /** Whether this spell triggers global cooldown */
  triggersGCD: boolean;

  /** Whether this spell can be cast while moving */
  castWhileMoving: boolean;

  /** Whether this spell can crit */
  canCrit: boolean;

  /** Tags for filtering and categorization */
  tags: string[];
}

/**
 * LearnedSpell represents a spell that a character knows.
 */
export interface LearnedSpell {
  /** Reference to the spell definition */
  spellId: string;

  /** Highest rank learned */
  maxRankLearned: number;

  /** When the spell was first learned */
  learnedAt: Date;

  /** How the spell was learned */
  learnedFrom: SpellUnlockType;
}

/**
 * SpellBook contains all spells a character knows.
 */
export interface SpellBook {
  /** Character ID this spellbook belongs to */
  characterId: string;

  /** All learned spells */
  spells: LearnedSpell[];

  /** Last modified timestamp */
  updatedAt: Date;
}

/**
 * SpellModifier represents a modification to a spell from talents/buffs.
 */
export interface SpellModifier {
  /** Source of the modifier (talent ID, buff ID, etc.) */
  sourceId: string;

  /** Source type */
  sourceType: 'TALENT' | 'BUFF' | 'ITEM' | 'SET_BONUS';

  /** Which spell(s) this modifier affects (null = all spells of type) */
  affectedSpellIds: string[] | null;

  /** Which spell schools this affects (null = all) */
  affectedSchools: SpellSchool[] | null;

  /** What aspect is being modified */
  modifierType: ModifierType;

  /** How the modifier is applied */
  operation: ModifierOperation;

  /** The modifier value */
  value: number;

  /** Priority for stacking (higher = applied later) */
  priority: number;
}

/**
 * CooldownState tracks active cooldowns for a character.
 */
export interface CooldownState {
  /** Spell ID */
  spellId: string;

  /** When the cooldown started */
  startedAt: number;

  /** Cooldown duration in milliseconds */
  duration: number;

  /** When the cooldown expires */
  expiresAt: number;
}

/**
 * SpellCastRequest is sent from client to server to cast a spell.
 */
export interface SpellCastRequest {
  /** Spell ID to cast */
  spellId: string;

  /** Target entity ID (if applicable) */
  targetId?: string;

  /** Target position (for ground-targeted spells) */
  targetPosition?: { x: number; y: number; z: number };

  /** Client timestamp */
  timestamp: number;
}

/**
 * SpellCastResult is the server response to a cast request.
 */
export interface SpellCastResult {
  /** Whether the cast was successful */
  success: boolean;

  /** Error code if failed */
  errorCode?: SpellCastError;

  /** Error message */
  errorMessage?: string;

  /** Cast start time (for cast-time spells) */
  castStartTime?: number;

  /** Cast end time */
  castEndTime?: number;
}

/**
 * Spell cast error codes.
 */
export enum SpellCastError {
  NOT_LEARNED = 'NOT_LEARNED',
  ON_COOLDOWN = 'ON_COOLDOWN',
  NOT_ENOUGH_MANA = 'NOT_ENOUGH_MANA',
  INVALID_TARGET = 'INVALID_TARGET',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  TARGET_DEAD = 'TARGET_DEAD',
  SILENCED = 'SILENCED',
  MOVING = 'MOVING',
  ALREADY_CASTING = 'ALREADY_CASTING',
  LINE_OF_SIGHT = 'LINE_OF_SIGHT',
  TARGET_IMMUNE = 'TARGET_IMMUNE',
}

/**
 * Utility function to get the current rank of a spell for a character.
 */
export function getCurrentSpellRank(
  spell: SpellDefinition,
  learnedSpell: LearnedSpell,
): SpellRank | null {
  const rankIndex = learnedSpell.maxRankLearned - 1;
  if (rankIndex >= 0 && rankIndex < spell.ranks.length) {
    return spell.ranks[rankIndex];
  }
  return null;
}

/**
 * Utility function to get the next available rank to learn.
 */
export function getNextLearnableRank(
  spell: SpellDefinition,
  learnedSpell: LearnedSpell | null,
  characterLevel: number,
): SpellRank | null {
  const currentRank = learnedSpell?.maxRankLearned ?? 0;
  const nextRankIndex = currentRank; // 0-indexed

  if (nextRankIndex >= spell.ranks.length) {
    return null; // Already at max rank
  }

  const nextRank = spell.ranks[nextRankIndex];
  if (nextRank.levelRequired <= characterLevel) {
    return nextRank;
  }

  return null; // Not high enough level
}

/**
 * Utility function to apply modifiers to a spell's base values.
 */
export function applySpellModifiers(
  baseValue: number,
  modifiers: SpellModifier[],
  modifierType: ModifierType,
): number {
  let result = baseValue;

  // Sort by priority
  const sortedModifiers = [...modifiers]
    .filter((m) => m.modifierType === modifierType)
    .sort((a, b) => a.priority - b.priority);

  for (const mod of sortedModifiers) {
    switch (mod.operation) {
      case ModifierOperation.ADD:
        result += mod.value;
        break;
      case ModifierOperation.MULTIPLY:
        result *= mod.value;
        break;
      case ModifierOperation.SET:
        result = mod.value;
        break;
    }
  }

  return result;
}
