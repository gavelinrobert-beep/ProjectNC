/**
 * Talent Tree System
 * Implements WoW-style talent trees with specializations,
 * rows, columns, prerequisites, and multi-point nodes.
 */

import { Class } from '../enums';
import { TalentNodeType, ModifierType, ModifierOperation, SpellSchool } from './enums';
import { SpellModifier } from './spells';

/**
 * TalentTreeSpec represents a specialization within a class.
 * Each class typically has 3 specializations (e.g., Fire/Frost/Arcane for Mage).
 */
export interface TalentTreeSpec {
  /** Unique identifier for this spec */
  id: string;

  /** Display name (e.g., "Fire", "Protection") */
  name: string;

  /** Description of the specialization */
  description: string;

  /** Icon asset path */
  icon: string;

  /** Which class this spec belongs to */
  class: Class;

  /** Primary spell school for this spec */
  primarySchool: SpellSchool;

  /** Role this spec fulfills */
  role: 'TANK' | 'HEALER' | 'DPS_MELEE' | 'DPS_RANGED' | 'HYBRID';

  /** All talent nodes in this tree */
  nodes: TalentNode[];

  /** Maximum points that can be spent in this tree */
  maxPoints: number;

  /** Background image for the talent tree UI */
  backgroundImage?: string;
}

/**
 * TalentNode represents a single talent in the tree.
 */
export interface TalentNode {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description (use {value} for rank-based values) */
  description: string;

  /** Icon asset path */
  icon: string;

  /** Type of talent node */
  type: TalentNodeType;

  /** Row position (0-indexed from top) */
  row: number;

  /** Column position (0-indexed from left) */
  column: number;

  /** Maximum points that can be spent (1-5) */
  maxPoints: number;

  /** Values per point (for description interpolation) */
  valuesPerPoint: number[];

  /** Total points required in tree to unlock this row */
  requiredTreePoints: number;

  /** Prerequisite talent IDs (must have max points in these) */
  prerequisites: string[];

  /** Spell ID unlocked by this talent (for SPELL type) */
  unlockedSpellId?: string;

  /** Modifiers granted per point (for MODIFIER type) */
  modifiersPerPoint?: TalentModifierDefinition[];

  /** Proc effect (for PROC type) */
  procEffect?: TalentProcEffect;
}

/**
 * TalentModifierDefinition defines a modifier granted by a talent.
 */
export interface TalentModifierDefinition {
  /** What aspect is being modified */
  modifierType: ModifierType;

  /** How the modifier is applied */
  operation: ModifierOperation;

  /** Value per talent point */
  valuePerPoint: number;

  /** Which spells are affected (null = all matching) */
  affectedSpellIds?: string[];

  /** Which spell schools are affected (null = all) */
  affectedSchools?: SpellSchool[];
}

/**
 * TalentProcEffect defines a chance-on-event effect.
 */
export interface TalentProcEffect {
  /** Trigger event */
  trigger: 'ON_HIT' | 'ON_CRIT' | 'ON_CAST' | 'ON_DAMAGE_TAKEN' | 'ON_HEAL' | 'ON_KILL';

  /** Proc chance (0.0 to 1.0) per point */
  procChancePerPoint: number;

  /** Effect to apply */
  effect: {
    type: 'APPLY_BUFF' | 'APPLY_DEBUFF' | 'INSTANT_DAMAGE' | 'INSTANT_HEAL' | 'COOLDOWN_RESET';
    auraId?: string;
    spellId?: string;
    value?: number;
    duration?: number;
  };

  /** Internal cooldown in milliseconds */
  internalCooldown: number;
}

/**
 * TalentAllocation represents a character's spent talent points.
 */
export interface TalentAllocation {
  /** Character ID */
  characterId: string;

  /** Points spent per node (nodeId -> points) */
  allocations: Record<string, number>;

  /** Total points spent per spec (specId -> total points) */
  specTotals: Record<string, number>;

  /** Primary spec (most points spent) */
  primarySpec?: string;

  /** Last respec timestamp */
  lastRespec?: Date;

  /** Respec count (for cost calculation) */
  respecCount: number;

  /** Last modified timestamp */
  updatedAt: Date;
}

/**
 * TalentPointInfo tracks available/spent talent points.
 */
export interface TalentPointInfo {
  /** Total points earned (typically level - 9, starting at level 10) */
  totalPoints: number;

  /** Points already allocated */
  spentPoints: number;

  /** Points available to spend */
  availablePoints: number;
}

/** Level at which players start earning talent points. */
export const TALENT_START_LEVEL = 10;

/** Offset for calculating talent points (level - offset = points). */
const TALENT_LEVEL_OFFSET = 9;

/**
 * Calculate total talent points available at a given level.
 * Talents typically start at TALENT_START_LEVEL.
 */
export function getTalentPointsForLevel(level: number): number {
  if (level < TALENT_START_LEVEL) return 0;
  return level - TALENT_LEVEL_OFFSET; // 1 point at level 10, 2 at 11, etc.
}

/**
 * Calculate spent talent points from allocations.
 */
export function getSpentPoints(allocation: TalentAllocation): number {
  return Object.values(allocation.allocations).reduce((sum, points) => sum + points, 0);
}

/**
 * Validate if a talent point can be allocated.
 */
export function canAllocatePoint(
  spec: TalentTreeSpec,
  node: TalentNode,
  allocation: TalentAllocation,
  characterLevel: number,
): { canAllocate: boolean; reason?: string } {
  // Check if we have points available
  const totalPoints = getTalentPointsForLevel(characterLevel);
  const spentPoints = getSpentPoints(allocation);
  if (spentPoints >= totalPoints) {
    return { canAllocate: false, reason: 'No talent points available' };
  }

  // Check if node is already maxed
  const currentPoints = allocation.allocations[node.id] || 0;
  if (currentPoints >= node.maxPoints) {
    return { canAllocate: false, reason: 'Talent already at maximum rank' };
  }

  // Check tree point requirement
  const specTotal = allocation.specTotals[spec.id] || 0;
  if (specTotal < node.requiredTreePoints) {
    return {
      canAllocate: false,
      reason: `Requires ${node.requiredTreePoints} points in ${spec.name}`,
    };
  }

  // Check prerequisites
  for (const prereqId of node.prerequisites) {
    const prereqNode = spec.nodes.find((n) => n.id === prereqId);
    if (!prereqNode) continue;

    const prereqPoints = allocation.allocations[prereqId] || 0;
    if (prereqPoints < prereqNode.maxPoints) {
      return {
        canAllocate: false,
        reason: `Requires ${prereqNode.name} (${prereqPoints}/${prereqNode.maxPoints})`,
      };
    }
  }

  return { canAllocate: true };
}

/**
 * Validate if a talent point can be deallocated (for respec).
 */
export function canDeallocatePoint(
  spec: TalentTreeSpec,
  node: TalentNode,
  allocation: TalentAllocation,
): { canDeallocate: boolean; reason?: string } {
  const currentPoints = allocation.allocations[node.id] || 0;
  if (currentPoints <= 0) {
    return { canDeallocate: false, reason: 'No points to remove' };
  }

  // Check if other talents depend on this one
  for (const otherNode of spec.nodes) {
    if (otherNode.prerequisites.includes(node.id)) {
      const otherPoints = allocation.allocations[otherNode.id] || 0;
      if (otherPoints > 0) {
        return {
          canDeallocate: false,
          reason: `${otherNode.name} requires this talent`,
        };
      }
    }
  }

  // Check if removing would break row requirements for other talents
  const newSpecTotal = (allocation.specTotals[spec.id] || 0) - 1;
  for (const otherNode of spec.nodes) {
    if (otherNode.id === node.id) continue;
    const otherPoints = allocation.allocations[otherNode.id] || 0;
    if (otherPoints > 0 && otherNode.requiredTreePoints > newSpecTotal) {
      return {
        canDeallocate: false,
        reason: `${otherNode.name} requires ${otherNode.requiredTreePoints} points in tree`,
      };
    }
  }

  return { canDeallocate: true };
}

/**
 * Generate spell modifiers from talent allocations.
 */
export function generateTalentModifiers(
  specs: TalentTreeSpec[],
  allocation: TalentAllocation,
): SpellModifier[] {
  const modifiers: SpellModifier[] = [];

  for (const spec of specs) {
    for (const node of spec.nodes) {
      const points = allocation.allocations[node.id] || 0;
      if (points === 0) continue;

      if (node.type === TalentNodeType.MODIFIER && node.modifiersPerPoint) {
        for (const modDef of node.modifiersPerPoint) {
          modifiers.push({
            sourceId: node.id,
            sourceType: 'TALENT',
            affectedSpellIds: modDef.affectedSpellIds || null,
            affectedSchools: modDef.affectedSchools || null,
            modifierType: modDef.modifierType,
            operation: modDef.operation,
            value: modDef.valuePerPoint * points,
            priority: 100, // Talent modifiers are mid-priority
          });
        }
      }
    }
  }

  return modifiers;
}

/**
 * Get the display value for a talent at a specific rank.
 */
export function getTalentValueAtRank(node: TalentNode, rank: number): number {
  if (rank <= 0 || rank > node.valuesPerPoint.length) {
    return 0;
  }
  return node.valuesPerPoint[rank - 1];
}

/**
 * Format a talent description with rank values.
 */
export function formatTalentDescription(node: TalentNode, currentRank: number): string {
  let description = node.description;

  // Replace {value} with current rank's value
  if (currentRank > 0 && currentRank <= node.valuesPerPoint.length) {
    description = description.replace('{value}', String(node.valuesPerPoint[currentRank - 1]));
  } else if (node.valuesPerPoint.length > 0) {
    // Show range for unallocated talents
    const min = node.valuesPerPoint[0];
    const max = node.valuesPerPoint[node.valuesPerPoint.length - 1];
    description = description.replace('{value}', `${min}-${max}`);
  }

  return description;
}

/**
 * Calculate respec cost based on respec count.
 * Cost typically increases with each respec.
 */
export function calculateRespecCost(respecCount: number): number {
  // Cost in copper (1 gold = 10000 copper)
  const baseCost = 10000; // 1 gold
  const maxCost = 500000; // 50 gold

  const cost = baseCost * Math.pow(2, Math.min(respecCount, 6));
  return Math.min(cost, maxCost);
}
