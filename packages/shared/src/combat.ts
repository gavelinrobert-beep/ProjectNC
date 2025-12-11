/**
 * Combat system types and interfaces
 */

import { CombatEventType } from './enums';

/**
 * Ability Definition - Template for abilities/spells
 */
export interface Ability {
  id: string;
  name: string;
  description: string;
  
  // Resource cost
  manaCost: number;
  energyCost?: number;
  rageCost?: number;
  
  // Timing
  cooldown: number;        // milliseconds
  castTime: number;        // milliseconds (0 = instant)
  globalCooldown: number;  // milliseconds
  
  // Targeting
  range: number;           // yards
  requiresTarget: boolean;
  canTargetSelf: boolean;
  
  // Effects
  damageFormula?: string;  // e.g., "weaponDamage * 1.5 + spellPower * 0.8"
  healFormula?: string;
  
  // Future: Buffs, debuffs, area effects
  effects?: AbilityEffect[];
}

export interface AbilityEffect {
  type: 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'DOT' | 'HOT';
  value: number;
  duration?: number;  // milliseconds
}

/**
 * Combat Event - Sent from server to clients when combat happens
 */
export interface CombatEvent {
  type: CombatEventType;
  timestamp: number;
  
  sourceEntityId: string;
  targetEntityId: string;
  
  abilityId?: string;
  
  // Damage/Heal
  value?: number;
  isCritical?: boolean;
  
  // New health values for target
  targetCurrentHealth?: number;
  targetMaxHealth?: number;
  
  // Death
  isDead?: boolean;
}

/**
 * Active Cooldown - Track ability cooldowns per player
 */
export interface ActiveCooldown {
  abilityId: string;
  remainingMs: number;
  startedAt: number;
}

/**
 * Threat/Aggro - For tank mechanics (placeholder)
 * Future: Full threat table implementation
 */
export interface ThreatEntry {
  entityId: string;
  threatValue: number;
}
