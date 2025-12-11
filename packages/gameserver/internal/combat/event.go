package combat

// EventType represents the type of combat event
type EventType string

const (
	EventTypeDamage EventType = "DAMAGE"
	EventTypeHeal   EventType = "HEAL"
	EventTypeBuff   EventType = "BUFF"
	EventTypeDebuff EventType = "DEBUFF"
	EventTypeDeath  EventType = "DEATH"
)

// CombatEvent represents a combat action result
// This is sent to all nearby clients for display
type CombatEvent struct {
	Type EventType

	SourceEntityID string
	TargetEntityID string

	AbilityID string
	Value     int // Damage or healing amount

	TargetHealth    int
	TargetMaxHealth int

	IsCritical bool
	IsDead     bool

	Timestamp int64
}
