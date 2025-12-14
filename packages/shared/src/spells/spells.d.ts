import { Class } from '../enums';
import { SpellSchool, SpellType, TargetType, CastType, SpellUnlockType, ResourceType, ModifierType, ModifierOperation } from './enums';
export interface SpellEffect {
    id: string;
    type: 'DAMAGE' | 'HEAL' | 'APPLY_BUFF' | 'APPLY_DEBUFF' | 'DISPEL' | 'KNOCKBACK' | 'STUN' | 'SLOW' | 'SILENCE';
    school: SpellSchool;
    baseValue: number;
    spellPowerCoefficient: number;
    attackPowerCoefficient: number;
    duration?: number;
    tickInterval?: number;
    auraId?: string;
}
export interface SpellRank {
    rank: number;
    levelRequired: number;
    resourceCost: number;
    resourceType: ResourceType;
    castTime: number;
    cooldown: number;
    globalCooldown: number;
    range: number;
    effects: SpellEffect[];
    trainingCost: number;
    tooltip: string;
}
export interface SpellUnlockRequirement {
    type: SpellUnlockType;
    levelRequired?: number;
    questId?: string;
    talentId?: string;
    itemId?: string;
}
export interface SpellDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    school: SpellSchool;
    type: SpellType;
    targetType: TargetType;
    castType: CastType;
    allowedClasses: Class[];
    unlockRequirement: SpellUnlockRequirement;
    ranks: SpellRank[];
    triggersGCD: boolean;
    castWhileMoving: boolean;
    canCrit: boolean;
    tags: string[];
}
export interface LearnedSpell {
    spellId: string;
    maxRankLearned: number;
    learnedAt: Date;
    learnedFrom: SpellUnlockType;
}
export interface SpellBook {
    characterId: string;
    spells: LearnedSpell[];
    updatedAt: Date;
}
export interface SpellModifier {
    sourceId: string;
    sourceType: 'TALENT' | 'BUFF' | 'ITEM' | 'SET_BONUS';
    affectedSpellIds: string[] | null;
    affectedSchools: SpellSchool[] | null;
    modifierType: ModifierType;
    operation: ModifierOperation;
    value: number;
    priority: number;
}
export interface CooldownState {
    spellId: string;
    startedAt: number;
    duration: number;
    expiresAt: number;
}
export interface SpellCastRequest {
    spellId: string;
    targetId?: string;
    targetPosition?: {
        x: number;
        y: number;
        z: number;
    };
    timestamp: number;
}
export interface SpellCastResult {
    success: boolean;
    errorCode?: SpellCastError;
    errorMessage?: string;
    castStartTime?: number;
    castEndTime?: number;
}
export declare enum SpellCastError {
    NOT_LEARNED = "NOT_LEARNED",
    ON_COOLDOWN = "ON_COOLDOWN",
    NOT_ENOUGH_MANA = "NOT_ENOUGH_MANA",
    INVALID_TARGET = "INVALID_TARGET",
    OUT_OF_RANGE = "OUT_OF_RANGE",
    TARGET_DEAD = "TARGET_DEAD",
    SILENCED = "SILENCED",
    MOVING = "MOVING",
    ALREADY_CASTING = "ALREADY_CASTING",
    LINE_OF_SIGHT = "LINE_OF_SIGHT",
    TARGET_IMMUNE = "TARGET_IMMUNE"
}
export declare function getCurrentSpellRank(spell: SpellDefinition, learnedSpell: LearnedSpell): SpellRank | null;
export declare function getNextLearnableRank(spell: SpellDefinition, learnedSpell: LearnedSpell | null, characterLevel: number): SpellRank | null;
export declare function applySpellModifiers(baseValue: number, modifiers: SpellModifier[], modifierType: ModifierType): number;
