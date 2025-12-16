/**
 * WebSocket Protocol Messages
 * 
 * Messages between Frontend <-> Game Server
 * JSON format initially, will migrate to binary (MessagePack or Protocol Buffers) for performance
 * 
 * Message Format:
 * {
 *   type: string,
 *   payload: any
 * }
 */

import { Character } from './entities';

/**
 * Base message structure
 */
export interface GameMessage<T = any> {
  type: string;
  payload: T;
}

/**
 * CLIENT -> SERVER Messages
 */

// Player connects to game server after authentication
export interface ConnectMessage {
  token: string;         // JWT token from API
  characterId: string;   // Character to play
}

// Player movement input
export interface PlayerMoveMessage {
  // Target position
  x: number;
  y: number;
  z: number;
  
  // Input type (for different movement modes)
  moveType: 'WALK' | 'RUN' | 'JUMP';
  
  // Client timestamp for lag compensation
  timestamp: number;
}

// Player uses an ability
export interface AttackRequestMessage {
  abilityId: string;
  targetEntityId?: string;  // Optional - some abilities don't need target
  
  // Client position (for validation)
  x: number;
  y: number;
  z: number;
  
  timestamp: number;
}

// Player sends chat message
export interface ChatMessage {
  channel: 'SAY' | 'YELL' | 'WHISPER' | 'PARTY' | 'GUILD';
  message: string;
  targetPlayerId?: string;  // For whispers
}

// Player interacts with NPC or object
export interface InteractMessage {
  targetEntityId: string;
  interactionType: 'TALK' | 'LOOT' | 'USE';
}

// Player accepts a quest
export interface AcceptQuestMessage {
  questId: string;
}

// Player completes a quest
export interface CompleteQuestMessage {
  questId: string;
}

// Player abandons a quest
export interface AbandonQuestMessage {
  questId: string;
}

// Player uses an item
export interface UseItemMessage {
  inventoryItemId: string;
}

// Player equips an item
export interface EquipItemMessage {
  inventoryItemId: string;
  slot: number;
}

// Player moves an item in inventory
export interface MoveItemMessage {
  inventoryItemId: string;
  newSlot: number;
}

/**
 * SERVER -> CLIENT Messages
 */

// Server acknowledges connection and sends initial game state
export interface WelcomeMessage {
  playerId: string;
  character: Character;
  nearbyEntities: EntityUpdate[];
  serverTime: number;
}

// Server broadcasts entity updates (positions, states)
export interface EntityUpdate {
  entityId: string;
  entityType: 'PLAYER' | 'NPC' | 'MONSTER' | 'OBJECT';
  
  // Position
  x: number;
  y: number;
  z: number;
  rotation: number;
  
  // State
  name?: string;
  level?: number;
  health?: number;
  maxHealth?: number;
  
  // Animation state
  isMoving?: boolean;
  isCasting?: boolean;
  isInCombat?: boolean;
  
  // Timestamp
  timestamp: number;
}

// Server sends combat event
export interface CombatEventMessage {
  eventType: 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'DEATH';
  
  sourceEntityId: string;
  targetEntityId: string;
  
  abilityId?: string;
  abilityName?: string;
  
  value?: number;
  isCritical?: boolean;
  
  targetHealth?: number;
  targetMaxHealth?: number;
  
  timestamp: number;
}

// Entity enters player's view range
export interface EntitySpawnMessage {
  entity: EntityUpdate;
}

// Entity leaves player's view range
export interface EntityDespawnMessage {
  entityId: string;
}

// Server error message
export interface ErrorMessage {
  code: string;
  message: string;
  timestamp: number;
}

// Quest progress update
export interface QuestProgressMessage {
  questId: string;
  objectives: QuestObjectiveProgress[];
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface QuestObjectiveProgress {
  id: string;
  description: string;
  current: number;
  required: number;
  completed: boolean;
}

// Quest completion notification
export interface QuestCompletedMessage {
  questId: string;
  questName: string;
  rewards: {
    experience: number;
    gold: number;
    items?: string[];
  };
}

// Inventory update
export interface InventoryUpdateMessage {
  items: InventoryItemData[];
}

export interface InventoryItemData {
  id: string;
  itemDefinitionId: string;
  quantity: number;
  slot: number;
}

// Item looted notification
export interface ItemLootedMessage {
  itemDefinitionId: string;
  quantity: number;
}

/**
 * Message Type Constants
 * Used to identify message types in the protocol
 */
export const MessageType = {
  // Client -> Server
  CONNECT: 'CONNECT',
  PLAYER_MOVE: 'PLAYER_MOVE',
  ATTACK_REQUEST: 'ATTACK_REQUEST',
  CHAT: 'CHAT',
  INTERACT: 'INTERACT',
  ACCEPT_QUEST: 'ACCEPT_QUEST',
  COMPLETE_QUEST: 'COMPLETE_QUEST',
  ABANDON_QUEST: 'ABANDON_QUEST',
  USE_ITEM: 'USE_ITEM',
  EQUIP_ITEM: 'EQUIP_ITEM',
  MOVE_ITEM: 'MOVE_ITEM',
  
  // Server -> Client
  WELCOME: 'WELCOME',
  ENTITY_UPDATE: 'ENTITY_UPDATE',
  COMBAT_EVENT: 'COMBAT_EVENT',
  ENTITY_SPAWN: 'ENTITY_SPAWN',
  ENTITY_DESPAWN: 'ENTITY_DESPAWN',
  QUEST_PROGRESS: 'QUEST_PROGRESS',
  QUEST_COMPLETED: 'QUEST_COMPLETED',
  INVENTORY_UPDATE: 'INVENTORY_UPDATE',
  ITEM_LOOTED: 'ITEM_LOOTED',
  ERROR: 'ERROR',
} as const;

/**
 * Future Protocol Enhancements:
 * 
 * 1. Binary Protocol Migration:
 *    - Use MessagePack or Protocol Buffers for smaller payload size
 *    - Reduces bandwidth by 40-60%
 *    - Faster serialization/deserialization
 * 
 * 2. Delta Compression:
 *    - Only send changed entity properties
 *    - Critical for large numbers of entities
 * 
 * 3. Interpolation Data:
 *    - Add velocity vectors for smooth client-side prediction
 * 
 * 4. Priority System:
 *    - Critical messages (combat) get priority over cosmetic updates
 * 
 * 5. Batching:
 *    - Group multiple entity updates in single message
 *    - Send at fixed tick rate (20-30 Hz)
 */
