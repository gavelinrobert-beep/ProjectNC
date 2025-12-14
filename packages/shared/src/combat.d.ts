import { CombatEventType } from './enums';
export interface Ability {
    id: string;
    name: string;
    description: string;
    manaCost: number;
    energyCost?: number;
    rageCost?: number;
    cooldown: number;
    castTime: number;
    globalCooldown: number;
    range: number;
    requiresTarget: boolean;
    canTargetSelf: boolean;
    damageFormula?: string;
    healFormula?: string;
    effects?: AbilityEffect[];
}
export interface AbilityEffect {
    type: 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'DOT' | 'HOT';
    value: number;
    duration?: number;
}
export interface CombatEvent {
    type: CombatEventType;
    timestamp: number;
    sourceEntityId: string;
    targetEntityId: string;
    abilityId?: string;
    value?: number;
    isCritical?: boolean;
    targetCurrentHealth?: number;
    targetMaxHealth?: number;
    isDead?: boolean;
}
export interface ActiveCooldown {
    abilityId: string;
    remainingMs: number;
    startedAt: number;
}
export interface ThreatEntry {
    entityId: string;
    threatValue: number;
}
