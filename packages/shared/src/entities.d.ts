import { Race, Class, EntityType, ItemRarity, ItemType, EquipmentSlot } from './enums';
export interface CharacterStats {
    strength: number;
    agility: number;
    intellect: number;
    stamina: number;
    spirit: number;
}
export interface Character {
    id: string;
    accountId: string;
    name: string;
    race: Race;
    class: Class;
    level: number;
    experience: number;
    stats: CharacterStats;
    maxHealth: number;
    maxMana: number;
    currentHealth: number;
    currentMana: number;
    zoneId: string;
    x: number;
    y: number;
    z: number;
    rotation: number;
    createdAt: Date;
    lastLogin: Date;
}
export interface ItemDefinition {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    level: number;
    slot?: EquipmentSlot;
    stats?: Partial<CharacterStats>;
    armor?: number;
    weaponDamage?: [number, number];
    maxStack: number;
    sellPrice: number;
    buyPrice?: number;
}
export interface InventoryItem {
    id: string;
    characterId: string;
    itemDefinitionId: string;
    quantity: number;
    slot: number;
}
export interface Quest {
    id: string;
    name: string;
    description: string;
    level: number;
    requiredLevel: number;
    prerequisiteQuestIds?: string[];
    objectives: QuestObjective[];
    experienceReward: number;
    goldReward: number;
    itemRewards?: string[];
}
export interface QuestObjective {
    id: string;
    description: string;
    type: 'KILL' | 'COLLECT' | 'INTERACT';
    targetId: string;
    required: number;
    current: number;
}
export interface Zone {
    id: string;
    name: string;
    description: string;
    recommendedLevel: [number, number];
    width: number;
    height: number;
    safeZones: Position3D[];
}
export interface Position3D {
    x: number;
    y: number;
    z: number;
}
export interface NPC {
    id: string;
    name: string;
    level: number;
    type: EntityType;
    zoneId: string;
    x: number;
    y: number;
    z: number;
    isQuestGiver: boolean;
    isVendor: boolean;
    isHostile: boolean;
    health?: number;
    damage?: [number, number];
    abilities?: string[];
}
