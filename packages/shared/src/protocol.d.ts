import { Character } from './entities';
export interface GameMessage<T = any> {
    type: string;
    payload: T;
}
export interface ConnectMessage {
    token: string;
    characterId: string;
}
export interface PlayerMoveMessage {
    x: number;
    y: number;
    z: number;
    moveType: 'WALK' | 'RUN' | 'JUMP';
    timestamp: number;
}
export interface AttackRequestMessage {
    abilityId: string;
    targetEntityId?: string;
    x: number;
    y: number;
    z: number;
    timestamp: number;
}
export interface ChatMessage {
    channel: 'SAY' | 'YELL' | 'WHISPER' | 'PARTY' | 'GUILD';
    message: string;
    targetPlayerId?: string;
}
export interface InteractMessage {
    targetEntityId: string;
    interactionType: 'TALK' | 'LOOT' | 'USE';
}
export interface WelcomeMessage {
    playerId: string;
    character: Character;
    nearbyEntities: EntityUpdate[];
    serverTime: number;
}
export interface EntityUpdate {
    entityId: string;
    entityType: 'PLAYER' | 'NPC' | 'MONSTER' | 'OBJECT';
    x: number;
    y: number;
    z: number;
    rotation: number;
    name?: string;
    level?: number;
    health?: number;
    maxHealth?: number;
    isMoving?: boolean;
    isCasting?: boolean;
    isInCombat?: boolean;
    timestamp: number;
}
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
export interface EntitySpawnMessage {
    entity: EntityUpdate;
}
export interface EntityDespawnMessage {
    entityId: string;
}
export interface ErrorMessage {
    code: string;
    message: string;
    timestamp: number;
}
export declare const MessageType: {
    readonly CONNECT: "CONNECT";
    readonly PLAYER_MOVE: "PLAYER_MOVE";
    readonly ATTACK_REQUEST: "ATTACK_REQUEST";
    readonly CHAT: "CHAT";
    readonly INTERACT: "INTERACT";
    readonly WELCOME: "WELCOME";
    readonly ENTITY_UPDATE: "ENTITY_UPDATE";
    readonly COMBAT_EVENT: "COMBAT_EVENT";
    readonly ENTITY_SPAWN: "ENTITY_SPAWN";
    readonly ENTITY_DESPAWN: "ENTITY_DESPAWN";
    readonly ERROR: "ERROR";
};
