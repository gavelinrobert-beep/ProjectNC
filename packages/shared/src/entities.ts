/**
 * Entity data structures shared between services
 */

import { Race, Class, EntityType, ItemRarity, ItemType, EquipmentSlot } from './enums';

/**
 * Character Stats - Core attributes
 */
export interface CharacterStats {
  strength: number;      // Increases melee damage
  agility: number;       // Increases dodge, attack speed
  intellect: number;     // Increases spell power, mana pool
  stamina: number;       // Increases health pool
  spirit: number;        // Health/mana regeneration
}

/**
 * Character Data - Persistent character information
 */
export interface Character {
  id: string;
  accountId: string;
  name: string;
  race: Race;
  class: Class;
  level: number;
  experience: number;
  
  // Stats
  stats: CharacterStats;
  maxHealth: number;
  maxMana: number;
  currentHealth: number;
  currentMana: number;
  
  // Position (last known)
  zoneId: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  
  // Timestamps
  createdAt: Date;
  lastLogin: Date;
}

/**
 * Item Definition - Static item template
 */
export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  
  // Equipment specific
  slot?: EquipmentSlot;
  stats?: Partial<CharacterStats>;
  armor?: number;
  weaponDamage?: [number, number]; // [min, max]
  
  // Stackable
  maxStack: number;
  
  // Vendor
  sellPrice: number;
  buyPrice?: number;
}

/**
 * Inventory Item - Instance of an item in player inventory
 */
export interface InventoryItem {
  id: string;
  characterId: string;
  itemDefinitionId: string;
  quantity: number;
  slot: number;
  
  // Future: Item-specific properties (durability, enchantments, etc.)
}

/**
 * Quest Definition
 */
export interface Quest {
  id: string;
  name: string;
  description: string;
  level: number;
  
  // Requirements
  requiredLevel: number;
  prerequisiteQuestIds?: string[];
  
  // Objectives (simplified for now)
  objectives: QuestObjective[];
  
  // Rewards
  experienceReward: number;
  goldReward: number;
  itemRewards?: string[]; // Item definition IDs
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'KILL' | 'COLLECT' | 'INTERACT';
  targetId: string;  // Monster ID or item ID
  required: number;
  current: number;
}

/**
 * Zone/Map Definition
 */
export interface Zone {
  id: string;
  name: string;
  description: string;
  recommendedLevel: [number, number]; // [min, max]
  
  // Map data
  width: number;
  height: number;
  
  // Spawn points
  safeZones: Position3D[];
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * NPC Definition
 */
export interface NPC {
  id: string;
  name: string;
  level: number;
  type: EntityType;
  
  // Position
  zoneId: string;
  x: number;
  y: number;
  z: number;
  
  // Behavior
  isQuestGiver: boolean;
  isVendor: boolean;
  isHostile: boolean;
  
  // Combat (if hostile)
  health?: number;
  damage?: [number, number];
  abilities?: string[];
}
