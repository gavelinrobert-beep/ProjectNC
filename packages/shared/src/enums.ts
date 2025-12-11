/**
 * Game enums shared across all services
 */

export enum Race {
  HUMAN = 'HUMAN',
  ELF = 'ELF',
  DWARF = 'DWARF',
  ORC = 'ORC',
}

export enum Class {
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  ROGUE = 'ROGUE',
  PRIEST = 'PRIEST',
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  CONSUMABLE = 'CONSUMABLE',
  QUEST_ITEM = 'QUEST_ITEM',
  MATERIAL = 'MATERIAL',
}

export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export enum EquipmentSlot {
  HEAD = 'HEAD',
  CHEST = 'CHEST',
  LEGS = 'LEGS',
  FEET = 'FEET',
  HANDS = 'HANDS',
  MAIN_HAND = 'MAIN_HAND',
  OFF_HAND = 'OFF_HAND',
  NECK = 'NECK',
  RING_1 = 'RING_1',
  RING_2 = 'RING_2',
}

export enum QuestStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  TURNED_IN = 'TURNED_IN',
}

export enum EntityType {
  PLAYER = 'PLAYER',
  NPC = 'NPC',
  MONSTER = 'MONSTER',
  OBJECT = 'OBJECT',
}

export enum CombatEventType {
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL',
  BUFF = 'BUFF',
  DEBUFF = 'DEBUFF',
  DEATH = 'DEATH',
}
