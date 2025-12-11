package protocol

// GameMessage is the base message structure for all WebSocket messages
type GameMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// ConnectMessage - Client connects with JWT token
type ConnectMessage struct {
	Token       string `json:"token"`
	CharacterID string `json:"characterId"`
}

// PlayerMoveMessage - Client sends movement input
type PlayerMoveMessage struct {
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Z         float64 `json:"z"`
	MoveType  string  `json:"moveType"` // WALK, RUN, JUMP
	Timestamp int64   `json:"timestamp"`
}

// AttackRequestMessage - Client uses an ability
type AttackRequestMessage struct {
	AbilityID      string  `json:"abilityId"`
	TargetEntityID string  `json:"targetEntityId,omitempty"`
	X              float64 `json:"x"`
	Y              float64 `json:"y"`
	Z              float64 `json:"z"`
	Timestamp      int64   `json:"timestamp"`
}

// ChatMessage - Client sends chat
type ChatMessage struct {
	Channel        string `json:"channel"` // SAY, YELL, WHISPER, PARTY, GUILD
	Message        string `json:"message"`
	TargetPlayerID string `json:"targetPlayerId,omitempty"`
}

// WelcomeMessage - Server acknowledges connection
type WelcomeMessage struct {
	PlayerID   string        `json:"playerId"`
	Character  CharacterData `json:"character"`
	ServerTime int64         `json:"serverTime"`
}

type CharacterData struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Level int    `json:"level"`
	Class string `json:"class"`
}

// EntityUpdate - Server broadcasts entity state
type EntityUpdate struct {
	EntityID   string  `json:"entityId"`
	Type       string  `json:"type"`
	X          float64 `json:"x"`
	Y          float64 `json:"y"`
	Z          float64 `json:"z"`
	Rotation   float64 `json:"rotation"`
	Name       string  `json:"name,omitempty"`
	Level      int     `json:"level,omitempty"`
	Health     int     `json:"health,omitempty"`
	MaxHealth  int     `json:"maxHealth,omitempty"`
	IsMoving   bool    `json:"isMoving,omitempty"`
	IsCasting  bool    `json:"isCasting,omitempty"`
	IsInCombat bool    `json:"isInCombat,omitempty"`
	Timestamp  int64   `json:"timestamp"`
}

// CombatEventMessage - Server sends combat event
type CombatEventMessage struct {
	Type            string `json:"type"` // DAMAGE, HEAL, BUFF, DEBUFF, DEATH
	SourceEntityID  string `json:"sourceEntityId"`
	TargetEntityID  string `json:"targetEntityId"`
	AbilityID       string `json:"abilityId,omitempty"`
	AbilityName     string `json:"abilityName,omitempty"`
	Value           int    `json:"value,omitempty"`
	IsCritical      bool   `json:"isCritical,omitempty"`
	TargetHealth    int    `json:"targetHealth,omitempty"`
	TargetMaxHealth int    `json:"targetMaxHealth,omitempty"`
	Timestamp       int64  `json:"timestamp"`
}
