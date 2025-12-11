/**
 * Spell System Enums
 * Defines all enumerations used by the spell and talent systems.
 */

/**
 * SpellSchool represents the magical school/element of a spell.
 * Used for resistance calculations and talent bonuses.
 */
export enum SpellSchool {
  PHYSICAL = 'PHYSICAL',
  FIRE = 'FIRE',
  FROST = 'FROST',
  ARCANE = 'ARCANE',
  NATURE = 'NATURE',
  SHADOW = 'SHADOW',
  HOLY = 'HOLY',
}

/**
 * SpellType categorizes spells by their primary function.
 */
export enum SpellType {
  DAMAGE = 'DAMAGE',           // Direct damage spells
  HEAL = 'HEAL',               // Healing spells
  BUFF = 'BUFF',               // Beneficial effects
  DEBUFF = 'DEBUFF',           // Harmful effects
  UTILITY = 'UTILITY',         // Non-combat utility
  SUMMON = 'SUMMON',           // Summon creatures/objects
  TRANSFORM = 'TRANSFORM',     // Polymorph, shapeshift, etc.
}

/**
 * TargetType defines what a spell can target.
 */
export enum TargetType {
  SELF = 'SELF',               // Caster only
  SINGLE_ENEMY = 'SINGLE_ENEMY',
  SINGLE_ALLY = 'SINGLE_ALLY',
  SINGLE_ANY = 'SINGLE_ANY',   // Friend or foe
  AOE_ENEMY = 'AOE_ENEMY',     // Area of effect, enemies
  AOE_ALLY = 'AOE_ALLY',       // Area of effect, allies
  AOE_ALL = 'AOE_ALL',         // Area of effect, everyone
  CONE = 'CONE',               // Cone in front of caster
  LINE = 'LINE',               // Line from caster
  GROUND = 'GROUND',           // Target location
}

/**
 * CastType defines how a spell is cast.
 */
export enum CastType {
  INSTANT = 'INSTANT',         // No cast time
  CAST = 'CAST',               // Has a cast time
  CHANNEL = 'CHANNEL',         // Channeled over time
}

/**
 * SpellUnlockType defines how a spell is learned.
 */
export enum SpellUnlockType {
  LEVEL = 'LEVEL',             // Unlocked at a specific level
  QUEST = 'QUEST',             // Unlocked by completing a quest
  TALENT = 'TALENT',           // Unlocked by talent point
  TRAINER = 'TRAINER',         // Learned from a trainer (may require gold)
  ITEM = 'ITEM',               // Learned from an item (spell book, scroll)
  CLASS_QUEST = 'CLASS_QUEST', // Specific class quest line
}

/**
 * TalentNodeType defines the type of talent node.
 */
export enum TalentNodeType {
  PASSIVE = 'PASSIVE',         // Always active once learned
  SPELL = 'SPELL',             // Unlocks a new spell
  MODIFIER = 'MODIFIER',       // Modifies existing spell(s)
  PROC = 'PROC',               // Chance on hit/cast effect
}

/**
 * ModifierType defines what aspect of a spell is modified.
 */
export enum ModifierType {
  DAMAGE = 'DAMAGE',           // Damage amount
  HEALING = 'HEALING',         // Healing amount
  COOLDOWN = 'COOLDOWN',       // Cooldown reduction
  CAST_TIME = 'CAST_TIME',     // Cast time reduction
  MANA_COST = 'MANA_COST',     // Mana cost reduction
  CRIT_CHANCE = 'CRIT_CHANCE', // Critical strike chance
  CRIT_DAMAGE = 'CRIT_DAMAGE', // Critical strike damage
  RANGE = 'RANGE',             // Spell range
  DURATION = 'DURATION',       // Effect duration
  DOT_TICK = 'DOT_TICK',       // Damage over time tick rate
  AOE_RADIUS = 'AOE_RADIUS',   // Area of effect size
}

/**
 * ModifierOperation defines how a modifier is applied.
 */
export enum ModifierOperation {
  ADD = 'ADD',                 // Add flat amount
  MULTIPLY = 'MULTIPLY',       // Multiply by percentage
  SET = 'SET',                 // Set to exact value
}

/**
 * ResourceType defines the resource consumed by abilities.
 */
export enum ResourceType {
  MANA = 'MANA',
  RAGE = 'RAGE',
  ENERGY = 'ENERGY',
  FOCUS = 'FOCUS',
  COMBO_POINTS = 'COMBO_POINTS',
  HEALTH = 'HEALTH',           // Life tap style abilities
}
