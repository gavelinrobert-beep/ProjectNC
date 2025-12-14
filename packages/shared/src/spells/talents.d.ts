import { Class } from '../enums';
import { TalentNodeType, ModifierType, ModifierOperation, SpellSchool } from './enums';
import { SpellModifier } from './spells';
export interface TalentTreeSpec {
    id: string;
    name: string;
    description: string;
    icon: string;
    class: Class;
    primarySchool: SpellSchool;
    role: 'TANK' | 'HEALER' | 'DPS_MELEE' | 'DPS_RANGED' | 'HYBRID';
    nodes: TalentNode[];
    maxPoints: number;
    backgroundImage?: string;
}
export interface TalentNode {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: TalentNodeType;
    row: number;
    column: number;
    maxPoints: number;
    valuesPerPoint: number[];
    requiredTreePoints: number;
    prerequisites: string[];
    unlockedSpellId?: string;
    modifiersPerPoint?: TalentModifierDefinition[];
    procEffect?: TalentProcEffect;
}
export interface TalentModifierDefinition {
    modifierType: ModifierType;
    operation: ModifierOperation;
    valuePerPoint: number;
    affectedSpellIds?: string[];
    affectedSchools?: SpellSchool[];
}
export interface TalentProcEffect {
    trigger: 'ON_HIT' | 'ON_CRIT' | 'ON_CAST' | 'ON_DAMAGE_TAKEN' | 'ON_HEAL' | 'ON_KILL';
    procChancePerPoint: number;
    effect: {
        type: 'APPLY_BUFF' | 'APPLY_DEBUFF' | 'INSTANT_DAMAGE' | 'INSTANT_HEAL' | 'COOLDOWN_RESET';
        auraId?: string;
        spellId?: string;
        value?: number;
        duration?: number;
    };
    internalCooldown: number;
}
export interface TalentAllocation {
    characterId: string;
    allocations: Record<string, number>;
    specTotals: Record<string, number>;
    primarySpec?: string;
    lastRespec?: Date;
    respecCount: number;
    updatedAt: Date;
}
export interface TalentPointInfo {
    totalPoints: number;
    spentPoints: number;
    availablePoints: number;
}
export declare const TALENT_START_LEVEL = 10;
export declare function getTalentPointsForLevel(level: number): number;
export declare function getSpentPoints(allocation: TalentAllocation): number;
export declare function canAllocatePoint(spec: TalentTreeSpec, node: TalentNode, allocation: TalentAllocation, characterLevel: number): {
    canAllocate: boolean;
    reason?: string;
};
export declare function canDeallocatePoint(spec: TalentTreeSpec, node: TalentNode, allocation: TalentAllocation): {
    canDeallocate: boolean;
    reason?: string;
};
export declare function generateTalentModifiers(specs: TalentTreeSpec[], allocation: TalentAllocation): SpellModifier[];
export declare function getTalentValueAtRank(node: TalentNode, rank: number): number;
export declare function formatTalentDescription(node: TalentNode, currentRank: number): string;
export declare function calculateRespecCost(respecCount: number): number;
