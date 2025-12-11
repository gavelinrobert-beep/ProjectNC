/**
 * Example Talent Tree Data for Mage Fire Specialization
 * Demonstrates the talent tree system with a complete spec.
 */

import { Class } from '../../enums';
import { SpellSchool, TalentNodeType, ModifierType, ModifierOperation } from '../enums';
import { TalentTreeSpec } from '../talents';

/**
 * Mage Fire Talent Tree
 * A complete example of a Fire Mage talent tree with 31 points total.
 */
export const MageFireTalentTree: TalentTreeSpec = {
  id: 'mage_fire',
  name: 'Fire',
  description: 'Focuses on fire-based damage spells, dealing massive direct damage and damage over time.',
  icon: 'talents/mage/fire',
  class: Class.MAGE,
  primarySchool: SpellSchool.FIRE,
  role: 'DPS_RANGED',
  maxPoints: 31,
  backgroundImage: 'talents/backgrounds/mage_fire',

  nodes: [
    // Row 0 (Tier 1) - 0 points required
    {
      id: 'improved_fireball',
      name: 'Improved Fireball',
      description: 'Reduces the casting time of your Fireball spell by {value} sec.',
      icon: 'talents/mage/improved_fireball',
      type: TalentNodeType.MODIFIER,
      row: 0,
      column: 1,
      maxPoints: 5,
      valuesPerPoint: [0.1, 0.2, 0.3, 0.4, 0.5],
      requiredTreePoints: 0,
      prerequisites: [],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.CAST_TIME,
          operation: ModifierOperation.ADD,
          valuePerPoint: -100, // Reduces cast time by 100ms per point
          affectedSpellIds: ['fireball'],
        },
      ],
    },
    {
      id: 'impact',
      name: 'Impact',
      description: 'Gives your Fire spells a {value}% chance to stun the target for 2 sec.',
      icon: 'talents/mage/impact',
      type: TalentNodeType.PROC,
      row: 0,
      column: 2,
      maxPoints: 5,
      valuesPerPoint: [2, 4, 6, 8, 10],
      requiredTreePoints: 0,
      prerequisites: [],
      procEffect: {
        trigger: 'ON_HIT',
        procChancePerPoint: 0.02,
        effect: {
          type: 'APPLY_DEBUFF',
          auraId: 'impact_stun',
          duration: 2000,
        },
        internalCooldown: 5000,
      },
    },

    // Row 1 (Tier 2) - 5 points required
    {
      id: 'ignite',
      name: 'Ignite',
      description: 'Your critical strikes from Fire damage spells cause the target to burn for {value}% of your spell\'s damage over 4 sec.',
      icon: 'talents/mage/ignite',
      type: TalentNodeType.PROC,
      row: 1,
      column: 0,
      maxPoints: 5,
      valuesPerPoint: [8, 16, 24, 32, 40],
      requiredTreePoints: 5,
      prerequisites: [],
      procEffect: {
        trigger: 'ON_CRIT',
        procChancePerPoint: 1.0, // Always procs on crit
        effect: {
          type: 'APPLY_DEBUFF',
          auraId: 'ignite_dot',
          duration: 4000,
        },
        internalCooldown: 0,
      },
    },
    {
      id: 'flame_throwing',
      name: 'Flame Throwing',
      description: 'Increases the range of your Fire spells by {value} yards.',
      icon: 'talents/mage/flame_throwing',
      type: TalentNodeType.MODIFIER,
      row: 1,
      column: 1,
      maxPoints: 2,
      valuesPerPoint: [3, 6],
      requiredTreePoints: 5,
      prerequisites: [],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.RANGE,
          operation: ModifierOperation.ADD,
          valuePerPoint: 3,
          affectedSchools: [SpellSchool.FIRE],
        },
      ],
    },
    {
      id: 'improved_fire_blast',
      name: 'Improved Fire Blast',
      description: 'Reduces the cooldown of your Fire Blast spell by {value} sec.',
      icon: 'talents/mage/improved_fire_blast',
      type: TalentNodeType.MODIFIER,
      row: 1,
      column: 2,
      maxPoints: 3,
      valuesPerPoint: [0.5, 1.0, 1.5],
      requiredTreePoints: 5,
      prerequisites: [],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.COOLDOWN,
          operation: ModifierOperation.ADD,
          valuePerPoint: -500, // Reduces cooldown by 500ms per point
          affectedSpellIds: ['fire_blast'],
        },
      ],
    },

    // Row 2 (Tier 3) - 10 points required
    {
      id: 'incinerate',
      name: 'Incinerate',
      description: 'Increases the critical strike chance of your Fire Blast and Scorch spells by {value}%.',
      icon: 'talents/mage/incinerate',
      type: TalentNodeType.MODIFIER,
      row: 2,
      column: 0,
      maxPoints: 2,
      valuesPerPoint: [2, 4],
      requiredTreePoints: 10,
      prerequisites: ['ignite'],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.CRIT_CHANCE,
          operation: ModifierOperation.ADD,
          valuePerPoint: 2,
          affectedSpellIds: ['fire_blast', 'scorch'],
        },
      ],
    },
    {
      id: 'improved_flamestrike',
      name: 'Improved Flamestrike',
      description: 'Increases the critical strike chance of your Flamestrike spell by {value}%.',
      icon: 'talents/mage/improved_flamestrike',
      type: TalentNodeType.MODIFIER,
      row: 2,
      column: 1,
      maxPoints: 3,
      valuesPerPoint: [5, 10, 15],
      requiredTreePoints: 10,
      prerequisites: [],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.CRIT_CHANCE,
          operation: ModifierOperation.ADD,
          valuePerPoint: 5,
          affectedSpellIds: ['flamestrike'],
        },
      ],
    },
    {
      id: 'pyroblast_talent',
      name: 'Pyroblast',
      description: 'Hurls an immense fiery boulder that causes 180 Fire damage and an additional 56 Fire damage over 12 sec.',
      icon: 'talents/mage/pyroblast',
      type: TalentNodeType.SPELL,
      row: 2,
      column: 2,
      maxPoints: 1,
      valuesPerPoint: [1],
      requiredTreePoints: 10,
      prerequisites: ['improved_fire_blast'],
      unlockedSpellId: 'pyroblast',
    },

    // Row 3 (Tier 4) - 15 points required
    {
      id: 'burning_soul',
      name: 'Burning Soul',
      description: 'Reduces the pushback suffered from damaging attacks while casting Fire spells by {value}%.',
      icon: 'talents/mage/burning_soul',
      type: TalentNodeType.PASSIVE,
      row: 3,
      column: 0,
      maxPoints: 2,
      valuesPerPoint: [35, 70],
      requiredTreePoints: 15,
      prerequisites: [],
    },
    {
      id: 'improved_scorch',
      name: 'Improved Scorch',
      description: 'Your Scorch spells have a {value}% chance to cause your target to be vulnerable to Fire damage. This vulnerability increases the Fire damage dealt to your target by 3% and lasts 30 sec. Stacks up to 5 times.',
      icon: 'talents/mage/improved_scorch',
      type: TalentNodeType.PROC,
      row: 3,
      column: 1,
      maxPoints: 3,
      valuesPerPoint: [33, 66, 100],
      requiredTreePoints: 15,
      prerequisites: [],
      procEffect: {
        trigger: 'ON_CAST',
        procChancePerPoint: 0.33,
        effect: {
          type: 'APPLY_DEBUFF',
          auraId: 'fire_vulnerability',
          duration: 30000,
        },
        internalCooldown: 0,
      },
    },
    {
      id: 'master_of_elements',
      name: 'Master of Elements',
      description: 'Your Fire and Frost spell criticals will refund {value}% of their base mana cost.',
      icon: 'talents/mage/master_of_elements',
      type: TalentNodeType.PROC,
      row: 3,
      column: 2,
      maxPoints: 3,
      valuesPerPoint: [10, 20, 30],
      requiredTreePoints: 15,
      prerequisites: [],
      procEffect: {
        trigger: 'ON_CRIT',
        procChancePerPoint: 1.0,
        effect: {
          type: 'INSTANT_HEAL', // Restores mana
          value: 0, // Calculated as percentage of spell cost
        },
        internalCooldown: 0,
      },
    },

    // Row 4 (Tier 5) - 20 points required
    {
      id: 'playing_with_fire',
      name: 'Playing with Fire',
      description: 'Increases all spell damage you deal by {value}%.',
      icon: 'talents/mage/playing_with_fire',
      type: TalentNodeType.MODIFIER,
      row: 4,
      column: 0,
      maxPoints: 3,
      valuesPerPoint: [1, 2, 3],
      requiredTreePoints: 20,
      prerequisites: [],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.DAMAGE,
          operation: ModifierOperation.MULTIPLY,
          valuePerPoint: 1.01, // 1% increase per point
        },
      ],
    },
    {
      id: 'critical_mass',
      name: 'Critical Mass',
      description: 'Increases the critical strike chance of your Fire spells by {value}%.',
      icon: 'talents/mage/critical_mass',
      type: TalentNodeType.MODIFIER,
      row: 4,
      column: 1,
      maxPoints: 3,
      valuesPerPoint: [2, 4, 6],
      requiredTreePoints: 20,
      prerequisites: [],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.CRIT_CHANCE,
          operation: ModifierOperation.ADD,
          valuePerPoint: 2,
          affectedSchools: [SpellSchool.FIRE],
        },
      ],
    },
    {
      id: 'blast_wave',
      name: 'Blast Wave',
      description: 'A wave of flame radiates outward from the caster, damaging all enemies caught within the blast for 160 to 192 Fire damage, and dazing them for 6 sec.',
      icon: 'talents/mage/blast_wave',
      type: TalentNodeType.SPELL,
      row: 4,
      column: 2,
      maxPoints: 1,
      valuesPerPoint: [1],
      requiredTreePoints: 20,
      prerequisites: ['pyroblast_talent'],
      unlockedSpellId: 'blast_wave',
    },

    // Row 5 (Tier 6) - 25 points required
    {
      id: 'fire_power',
      name: 'Fire Power',
      description: 'Increases the damage done by your Fire spells by {value}%.',
      icon: 'talents/mage/fire_power',
      type: TalentNodeType.MODIFIER,
      row: 5,
      column: 1,
      maxPoints: 5,
      valuesPerPoint: [2, 4, 6, 8, 10],
      requiredTreePoints: 25,
      prerequisites: ['critical_mass'],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.DAMAGE,
          operation: ModifierOperation.MULTIPLY,
          valuePerPoint: 1.02, // 2% increase per point
          affectedSchools: [SpellSchool.FIRE],
        },
      ],
    },

    // Row 6 (Tier 7) - 30 points required - Capstone
    {
      id: 'combustion',
      name: 'Combustion',
      description: 'When activated, this spell causes each of your Fire damage spell hits to increase your critical strike chance with Fire damage spells by 10%. This effect lasts until you have caused 3 critical strikes with Fire spells.',
      icon: 'talents/mage/combustion',
      type: TalentNodeType.SPELL,
      row: 6,
      column: 1,
      maxPoints: 1,
      valuesPerPoint: [1],
      requiredTreePoints: 30,
      prerequisites: ['fire_power'],
      unlockedSpellId: 'combustion',
    },
  ],
};

/**
 * Mage Frost Talent Tree (Placeholder)
 */
export const MageFrostTalentTree: TalentTreeSpec = {
  id: 'mage_frost',
  name: 'Frost',
  description: 'Focuses on frost-based damage and control spells, with emphasis on slowing and freezing enemies.',
  icon: 'talents/mage/frost',
  class: Class.MAGE,
  primarySchool: SpellSchool.FROST,
  role: 'DPS_RANGED',
  maxPoints: 31,
  backgroundImage: 'talents/backgrounds/mage_frost',
  nodes: [
    // Row 0
    {
      id: 'improved_frostbolt',
      name: 'Improved Frostbolt',
      description: 'Reduces the casting time of your Frostbolt spell by {value} sec.',
      icon: 'talents/mage/improved_frostbolt',
      type: TalentNodeType.MODIFIER,
      row: 0,
      column: 1,
      maxPoints: 5,
      valuesPerPoint: [0.1, 0.2, 0.3, 0.4, 0.5],
      requiredTreePoints: 0,
      prerequisites: [],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.CAST_TIME,
          operation: ModifierOperation.ADD,
          valuePerPoint: -100,
          affectedSpellIds: ['frostbolt'],
        },
      ],
    },
    {
      id: 'ice_shards',
      name: 'Ice Shards',
      description: 'Increases the critical strike damage bonus of your Frost spells by {value}%.',
      icon: 'talents/mage/ice_shards',
      type: TalentNodeType.MODIFIER,
      row: 0,
      column: 2,
      maxPoints: 5,
      valuesPerPoint: [20, 40, 60, 80, 100],
      requiredTreePoints: 0,
      prerequisites: [],
      modifiersPerPoint: [
        {
          modifierType: ModifierType.CRIT_DAMAGE,
          operation: ModifierOperation.ADD,
          valuePerPoint: 20,
          affectedSchools: [SpellSchool.FROST],
        },
      ],
    },
    // Additional frost talents would be added here...
  ],
};

/**
 * Mage Arcane Talent Tree (Placeholder)
 */
export const MageArcaneTalentTree: TalentTreeSpec = {
  id: 'mage_arcane',
  name: 'Arcane',
  description: 'Focuses on arcane-based damage and utility spells, with emphasis on mana efficiency and burst damage.',
  icon: 'talents/mage/arcane',
  class: Class.MAGE,
  primarySchool: SpellSchool.ARCANE,
  role: 'DPS_RANGED',
  maxPoints: 31,
  backgroundImage: 'talents/backgrounds/mage_arcane',
  nodes: [
    // Row 0
    {
      id: 'arcane_subtlety',
      name: 'Arcane Subtlety',
      description: 'Reduces the threat caused by your Arcane spells by {value}%.',
      icon: 'talents/mage/arcane_subtlety',
      type: TalentNodeType.MODIFIER,
      row: 0,
      column: 0,
      maxPoints: 2,
      valuesPerPoint: [20, 40],
      requiredTreePoints: 0,
      prerequisites: [],
      // Threat modifier would be handled specially
    },
    {
      id: 'arcane_focus',
      name: 'Arcane Focus',
      description: 'Reduces the chance that your Arcane spells will be dispelled by {value}%.',
      icon: 'talents/mage/arcane_focus',
      type: TalentNodeType.PASSIVE,
      row: 0,
      column: 1,
      maxPoints: 5,
      valuesPerPoint: [2, 4, 6, 8, 10],
      requiredTreePoints: 0,
      prerequisites: [],
    },
    // Additional arcane talents would be added here...
  ],
};

/**
 * All Mage Talent Trees
 */
export const AllMageTalentTrees: TalentTreeSpec[] = [
  MageFireTalentTree,
  MageFrostTalentTree,
  MageArcaneTalentTree,
];
