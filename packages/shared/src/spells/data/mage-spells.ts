/**
 * Example Spell Data for Mage Class
 * Contains sample spell definitions demonstrating the spell system.
 */

import { Class } from '../../enums';
import {
  SpellSchool,
  SpellType,
  TargetType,
  CastType,
  SpellUnlockType,
  ResourceType,
} from '../enums';
import { SpellDefinition } from '../spells';

/**
 * Mage Spells - Fire School
 */
export const MageFireSpells: SpellDefinition[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'Hurls a fiery ball that causes Fire damage.',
    icon: 'spells/fire/fireball',
    school: SpellSchool.FIRE,
    type: SpellType.DAMAGE,
    targetType: TargetType.SINGLE_ENEMY,
    castType: CastType.CAST,
    allowedClasses: [Class.MAGE],
    unlockRequirement: {
      type: SpellUnlockType.LEVEL,
      levelRequired: 1,
    },
    ranks: [
      {
        rank: 1,
        levelRequired: 1,
        resourceCost: 30,
        resourceType: ResourceType.MANA,
        castTime: 2500,
        cooldown: 0,
        globalCooldown: 1500,
        range: 35,
        effects: [
          {
            id: 'fireball_damage_1',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 22,
            spellPowerCoefficient: 0.857,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 0,
        tooltip: 'Hurls a fiery ball that causes 22 to 32 Fire damage.',
      },
      {
        rank: 2,
        levelRequired: 6,
        resourceCost: 45,
        resourceType: ResourceType.MANA,
        castTime: 2500,
        cooldown: 0,
        globalCooldown: 1500,
        range: 35,
        effects: [
          {
            id: 'fireball_damage_2',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 48,
            spellPowerCoefficient: 0.857,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 100,
        tooltip: 'Hurls a fiery ball that causes 48 to 65 Fire damage.',
      },
      {
        rank: 3,
        levelRequired: 12,
        resourceCost: 70,
        resourceType: ResourceType.MANA,
        castTime: 3000,
        cooldown: 0,
        globalCooldown: 1500,
        range: 35,
        effects: [
          {
            id: 'fireball_damage_3',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 85,
            spellPowerCoefficient: 1.0,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 500,
        tooltip: 'Hurls a fiery ball that causes 85 to 110 Fire damage.',
      },
      {
        rank: 4,
        levelRequired: 18,
        resourceCost: 100,
        resourceType: ResourceType.MANA,
        castTime: 3000,
        cooldown: 0,
        globalCooldown: 1500,
        range: 35,
        effects: [
          {
            id: 'fireball_damage_4',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 140,
            spellPowerCoefficient: 1.0,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 1500,
        tooltip: 'Hurls a fiery ball that causes 140 to 175 Fire damage.',
      },
      {
        rank: 5,
        levelRequired: 24,
        resourceCost: 140,
        resourceType: ResourceType.MANA,
        castTime: 3000,
        cooldown: 0,
        globalCooldown: 1500,
        range: 35,
        effects: [
          {
            id: 'fireball_damage_5',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 210,
            spellPowerCoefficient: 1.0,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 5000,
        tooltip: 'Hurls a fiery ball that causes 210 to 255 Fire damage.',
      },
    ],
    triggersGCD: true,
    castWhileMoving: false,
    canCrit: true,
    tags: ['fire', 'damage', 'direct'],
  },

  {
    id: 'fire_blast',
    name: 'Fire Blast',
    description: 'Blasts the enemy for Fire damage.',
    icon: 'spells/fire/fire_blast',
    school: SpellSchool.FIRE,
    type: SpellType.DAMAGE,
    targetType: TargetType.SINGLE_ENEMY,
    castType: CastType.INSTANT,
    allowedClasses: [Class.MAGE],
    unlockRequirement: {
      type: SpellUnlockType.LEVEL,
      levelRequired: 6,
    },
    ranks: [
      {
        rank: 1,
        levelRequired: 6,
        resourceCost: 40,
        resourceType: ResourceType.MANA,
        castTime: 0,
        cooldown: 8000,
        globalCooldown: 1500,
        range: 20,
        effects: [
          {
            id: 'fire_blast_damage_1',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 30,
            spellPowerCoefficient: 0.429,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 200,
        tooltip: 'Blasts the enemy for 30 to 40 Fire damage.',
      },
      {
        rank: 2,
        levelRequired: 14,
        resourceCost: 75,
        resourceType: ResourceType.MANA,
        castTime: 0,
        cooldown: 8000,
        globalCooldown: 1500,
        range: 20,
        effects: [
          {
            id: 'fire_blast_damage_2',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 65,
            spellPowerCoefficient: 0.429,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 1000,
        tooltip: 'Blasts the enemy for 65 to 85 Fire damage.',
      },
      {
        rank: 3,
        levelRequired: 22,
        resourceCost: 115,
        resourceType: ResourceType.MANA,
        castTime: 0,
        cooldown: 8000,
        globalCooldown: 1500,
        range: 20,
        effects: [
          {
            id: 'fire_blast_damage_3',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 115,
            spellPowerCoefficient: 0.429,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 3500,
        tooltip: 'Blasts the enemy for 115 to 145 Fire damage.',
      },
    ],
    triggersGCD: true,
    castWhileMoving: true,
    canCrit: true,
    tags: ['fire', 'damage', 'instant'],
  },

  {
    id: 'pyroblast',
    name: 'Pyroblast',
    description: 'Hurls an immense fiery boulder that causes Fire damage.',
    icon: 'spells/fire/pyroblast',
    school: SpellSchool.FIRE,
    type: SpellType.DAMAGE,
    targetType: TargetType.SINGLE_ENEMY,
    castType: CastType.CAST,
    allowedClasses: [Class.MAGE],
    unlockRequirement: {
      type: SpellUnlockType.TALENT,
      talentId: 'pyroblast_talent',
    },
    ranks: [
      {
        rank: 1,
        levelRequired: 20,
        resourceCost: 125,
        resourceType: ResourceType.MANA,
        castTime: 6000,
        cooldown: 0,
        globalCooldown: 1500,
        range: 35,
        effects: [
          {
            id: 'pyroblast_damage_1',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 180,
            spellPowerCoefficient: 1.15,
            attackPowerCoefficient: 0,
          },
          {
            id: 'pyroblast_dot_1',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 56,
            spellPowerCoefficient: 0.15,
            attackPowerCoefficient: 0,
            duration: 12000,
            tickInterval: 3000,
          },
        ],
        trainingCost: 0,
        tooltip: 'Hurls an immense fiery boulder that causes 180 Fire damage and an additional 56 Fire damage over 12 sec.',
      },
    ],
    triggersGCD: true,
    castWhileMoving: false,
    canCrit: true,
    tags: ['fire', 'damage', 'direct', 'dot', 'talent'],
  },

  {
    id: 'scorch',
    name: 'Scorch',
    description: 'Scorch the enemy for Fire damage.',
    icon: 'spells/fire/scorch',
    school: SpellSchool.FIRE,
    type: SpellType.DAMAGE,
    targetType: TargetType.SINGLE_ENEMY,
    castType: CastType.CAST,
    allowedClasses: [Class.MAGE],
    unlockRequirement: {
      type: SpellUnlockType.LEVEL,
      levelRequired: 22,
    },
    ranks: [
      {
        rank: 1,
        levelRequired: 22,
        resourceCost: 50,
        resourceType: ResourceType.MANA,
        castTime: 1500,
        cooldown: 0,
        globalCooldown: 1500,
        range: 30,
        effects: [
          {
            id: 'scorch_damage_1',
            type: 'DAMAGE',
            school: SpellSchool.FIRE,
            baseValue: 56,
            spellPowerCoefficient: 0.429,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 3000,
        tooltip: 'Scorch the enemy for 56 to 70 Fire damage.',
      },
    ],
    triggersGCD: true,
    castWhileMoving: false,
    canCrit: true,
    tags: ['fire', 'damage', 'direct', 'fast'],
  },
];

/**
 * Mage Spells - Frost School
 */
export const MageFrostSpells: SpellDefinition[] = [
  {
    id: 'frostbolt',
    name: 'Frostbolt',
    description: 'Launches a bolt of frost at the enemy, causing Frost damage and slowing movement speed.',
    icon: 'spells/frost/frostbolt',
    school: SpellSchool.FROST,
    type: SpellType.DAMAGE,
    targetType: TargetType.SINGLE_ENEMY,
    castType: CastType.CAST,
    allowedClasses: [Class.MAGE],
    unlockRequirement: {
      type: SpellUnlockType.LEVEL,
      levelRequired: 4,
    },
    ranks: [
      {
        rank: 1,
        levelRequired: 4,
        resourceCost: 25,
        resourceType: ResourceType.MANA,
        castTime: 2500,
        cooldown: 0,
        globalCooldown: 1500,
        range: 30,
        effects: [
          {
            id: 'frostbolt_damage_1',
            type: 'DAMAGE',
            school: SpellSchool.FROST,
            baseValue: 20,
            spellPowerCoefficient: 0.814,
            attackPowerCoefficient: 0,
          },
          {
            id: 'frostbolt_slow_1',
            type: 'APPLY_DEBUFF',
            school: SpellSchool.FROST,
            baseValue: 40, // 40% slow
            spellPowerCoefficient: 0,
            attackPowerCoefficient: 0,
            duration: 9000,
            auraId: 'frostbolt_chill',
          },
        ],
        trainingCost: 50,
        tooltip: 'Launches a bolt of frost at the enemy, causing 20 to 26 Frost damage and slowing movement speed by 40% for 9 sec.',
      },
      {
        rank: 2,
        levelRequired: 8,
        resourceCost: 35,
        resourceType: ResourceType.MANA,
        castTime: 2500,
        cooldown: 0,
        globalCooldown: 1500,
        range: 30,
        effects: [
          {
            id: 'frostbolt_damage_2',
            type: 'DAMAGE',
            school: SpellSchool.FROST,
            baseValue: 35,
            spellPowerCoefficient: 0.814,
            attackPowerCoefficient: 0,
          },
          {
            id: 'frostbolt_slow_2',
            type: 'APPLY_DEBUFF',
            school: SpellSchool.FROST,
            baseValue: 40,
            spellPowerCoefficient: 0,
            attackPowerCoefficient: 0,
            duration: 9000,
            auraId: 'frostbolt_chill',
          },
        ],
        trainingCost: 200,
        tooltip: 'Launches a bolt of frost at the enemy, causing 35 to 45 Frost damage and slowing movement speed by 40% for 9 sec.',
      },
      {
        rank: 3,
        levelRequired: 14,
        resourceCost: 50,
        resourceType: ResourceType.MANA,
        castTime: 2500,
        cooldown: 0,
        globalCooldown: 1500,
        range: 30,
        effects: [
          {
            id: 'frostbolt_damage_3',
            type: 'DAMAGE',
            school: SpellSchool.FROST,
            baseValue: 60,
            spellPowerCoefficient: 0.814,
            attackPowerCoefficient: 0,
          },
          {
            id: 'frostbolt_slow_3',
            type: 'APPLY_DEBUFF',
            school: SpellSchool.FROST,
            baseValue: 50,
            spellPowerCoefficient: 0,
            attackPowerCoefficient: 0,
            duration: 9000,
            auraId: 'frostbolt_chill',
          },
        ],
        trainingCost: 1000,
        tooltip: 'Launches a bolt of frost at the enemy, causing 60 to 75 Frost damage and slowing movement speed by 50% for 9 sec.',
      },
    ],
    triggersGCD: true,
    castWhileMoving: false,
    canCrit: true,
    tags: ['frost', 'damage', 'direct', 'slow'],
  },

  {
    id: 'frost_nova',
    name: 'Frost Nova',
    description: 'Blasts enemies near the caster for Frost damage and freezes them in place.',
    icon: 'spells/frost/frost_nova',
    school: SpellSchool.FROST,
    type: SpellType.DAMAGE,
    targetType: TargetType.AOE_ENEMY,
    castType: CastType.INSTANT,
    allowedClasses: [Class.MAGE],
    unlockRequirement: {
      type: SpellUnlockType.LEVEL,
      levelRequired: 10,
    },
    ranks: [
      {
        rank: 1,
        levelRequired: 10,
        resourceCost: 55,
        resourceType: ResourceType.MANA,
        castTime: 0,
        cooldown: 25000,
        globalCooldown: 1500,
        range: 0, // Self-centered AOE
        effects: [
          {
            id: 'frost_nova_damage_1',
            type: 'DAMAGE',
            school: SpellSchool.FROST,
            baseValue: 19,
            spellPowerCoefficient: 0.1,
            attackPowerCoefficient: 0,
          },
          {
            id: 'frost_nova_root_1',
            type: 'STUN',
            school: SpellSchool.FROST,
            baseValue: 0,
            spellPowerCoefficient: 0,
            attackPowerCoefficient: 0,
            duration: 8000,
            auraId: 'frost_nova_root',
          },
        ],
        trainingCost: 400,
        tooltip: 'Blasts enemies near the caster for 19 to 23 Frost damage and freezes them in place for up to 8 sec. Damage caused may interrupt the effect.',
      },
    ],
    triggersGCD: true,
    castWhileMoving: true,
    canCrit: true,
    tags: ['frost', 'damage', 'aoe', 'root', 'control'],
  },
];

/**
 * Mage Spells - Arcane School
 */
export const MageArcaneSpells: SpellDefinition[] = [
  {
    id: 'arcane_missiles',
    name: 'Arcane Missiles',
    description: 'Launches waves of Arcane Missiles at the enemy.',
    icon: 'spells/arcane/arcane_missiles',
    school: SpellSchool.ARCANE,
    type: SpellType.DAMAGE,
    targetType: TargetType.SINGLE_ENEMY,
    castType: CastType.CHANNEL,
    allowedClasses: [Class.MAGE],
    unlockRequirement: {
      type: SpellUnlockType.LEVEL,
      levelRequired: 8,
    },
    ranks: [
      {
        rank: 1,
        levelRequired: 8,
        resourceCost: 85,
        resourceType: ResourceType.MANA,
        castTime: 5000, // Channel duration
        cooldown: 0,
        globalCooldown: 1500,
        range: 30,
        effects: [
          {
            id: 'arcane_missiles_1',
            type: 'DAMAGE',
            school: SpellSchool.ARCANE,
            baseValue: 24, // Per missile, 5 missiles
            spellPowerCoefficient: 0.24,
            attackPowerCoefficient: 0,
            tickInterval: 1000,
            duration: 5000,
          },
        ],
        trainingCost: 300,
        tooltip: 'Launches Arcane Missiles at the enemy, causing 24 Arcane damage each second for 5 sec.',
      },
      {
        rank: 2,
        levelRequired: 16,
        resourceCost: 140,
        resourceType: ResourceType.MANA,
        castTime: 5000,
        cooldown: 0,
        globalCooldown: 1500,
        range: 30,
        effects: [
          {
            id: 'arcane_missiles_2',
            type: 'DAMAGE',
            school: SpellSchool.ARCANE,
            baseValue: 56,
            spellPowerCoefficient: 0.24,
            attackPowerCoefficient: 0,
            tickInterval: 1000,
            duration: 5000,
          },
        ],
        trainingCost: 1500,
        tooltip: 'Launches Arcane Missiles at the enemy, causing 56 Arcane damage each second for 5 sec.',
      },
    ],
    triggersGCD: true,
    castWhileMoving: false,
    canCrit: true,
    tags: ['arcane', 'damage', 'channel'],
  },

  {
    id: 'arcane_explosion',
    name: 'Arcane Explosion',
    description: 'Causes an explosion of arcane magic around the caster.',
    icon: 'spells/arcane/arcane_explosion',
    school: SpellSchool.ARCANE,
    type: SpellType.DAMAGE,
    targetType: TargetType.AOE_ENEMY,
    castType: CastType.INSTANT,
    allowedClasses: [Class.MAGE],
    unlockRequirement: {
      type: SpellUnlockType.LEVEL,
      levelRequired: 14,
    },
    ranks: [
      {
        rank: 1,
        levelRequired: 14,
        resourceCost: 75,
        resourceType: ResourceType.MANA,
        castTime: 0,
        cooldown: 0,
        globalCooldown: 1500,
        range: 0,
        effects: [
          {
            id: 'arcane_explosion_1',
            type: 'DAMAGE',
            school: SpellSchool.ARCANE,
            baseValue: 34,
            spellPowerCoefficient: 0.143,
            attackPowerCoefficient: 0,
          },
        ],
        trainingCost: 1200,
        tooltip: 'Causes an explosion of arcane magic around the caster, causing 34 to 38 Arcane damage to all targets within 10 yards.',
      },
    ],
    triggersGCD: true,
    castWhileMoving: true,
    canCrit: true,
    tags: ['arcane', 'damage', 'aoe', 'instant'],
  },
];

/**
 * All Mage spells combined.
 */
export const AllMageSpells: SpellDefinition[] = [
  ...MageFireSpells,
  ...MageFrostSpells,
  ...MageArcaneSpells,
];

/**
 * Spell data index by ID for quick lookup.
 */
export const MageSpellIndex: Record<string, SpellDefinition> = {};
AllMageSpells.forEach((spell) => {
  MageSpellIndex[spell.id] = spell;
});
