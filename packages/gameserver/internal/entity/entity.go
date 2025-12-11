package entity

import (
	"sync"
)

// EntityType represents the type of entity
type EntityType string

const (
	TypePlayer  EntityType = "PLAYER"
	TypeNPC     EntityType = "NPC"
	TypeMonster EntityType = "MONSTER"
)

// Position represents 3D coordinates
type Position struct {
	X        float64
	Y        float64
	Z        float64
	Rotation float64
}

// Stats represents character statistics
type Stats struct {
	Strength  int
	Agility   int
	Intellect int
	Stamina   int
	Spirit    int
}

// CombatState represents combat-related state
type CombatState struct {
	CurrentHealth int
	MaxHealth     int
	CurrentMana   int
	MaxMana       int
	IsInCombat    bool
	IsCasting     bool
	Target        string // Target entity ID
}

// Entity represents any entity in the game world
// Players, NPCs, and Monsters are all entities
type Entity struct {
	mu sync.RWMutex

	ID   string
	Name string
	Type EntityType

	Position    Position
	Stats       Stats
	CombatState CombatState

	Level int
	Class string // WARRIOR, MAGE, ROGUE, PRIEST

	// Movement state
	IsMoving       bool
	MoveTargetX    float64
	MoveTargetY    float64
	MoveTargetZ    float64
	MovementSpeed  float64 // units per second

	// Cooldowns (ability ID -> expiry timestamp)
	Cooldowns map[string]int64
}

// NewPlayerEntity creates a new player entity
func NewPlayerEntity(id, name, class string, stats Stats, position Position) *Entity {
	maxHealth := 50 + stats.Stamina*10
	maxMana := stats.Intellect * 15

	return &Entity{
		ID:    id,
		Name:  name,
		Type:  TypePlayer,
		Class: class,
		Level: 1,

		Position: position,
		Stats:    stats,

		CombatState: CombatState{
			CurrentHealth: maxHealth,
			MaxHealth:     maxHealth,
			CurrentMana:   maxMana,
			MaxMana:       maxMana,
		},

		MovementSpeed: 7.0, // units per second
		Cooldowns:     make(map[string]int64),
	}
}

// Update advances entity simulation by deltaTime
func (e *Entity) Update(deltaTime float64) {
	e.mu.Lock()
	defer e.mu.Unlock()

	// Update movement
	if e.IsMoving {
		e.updateMovement(deltaTime)
	}

	// Update cooldowns (handled by combat system)
	// Update buffs/debuffs (future)
	// Update AI behavior (for NPCs)
}

// updateMovement moves entity toward target position
func (e *Entity) updateMovement(deltaTime float64) {
	// Calculate direction to target
	dx := e.MoveTargetX - e.Position.X
	dy := e.MoveTargetY - e.Position.Y
	dz := e.MoveTargetZ - e.Position.Z

	// Calculate distance
	dist := sqrt(dx*dx + dy*dy + dz*dz)

	// If close enough, stop moving
	if dist < 0.1 {
		e.IsMoving = false
		return
	}

	// Normalize direction and move
	moveDistance := e.MovementSpeed * deltaTime
	if moveDistance > dist {
		moveDistance = dist
	}

	e.Position.X += (dx / dist) * moveDistance
	e.Position.Y += (dy / dist) * moveDistance
	e.Position.Z += (dz / dist) * moveDistance

	// Update rotation to face movement direction
	// (simplified - full rotation calculation would use atan2)
}

// SetMoveTarget sets a new movement target
func (e *Entity) SetMoveTarget(x, y, z float64) {
	e.mu.Lock()
	defer e.mu.Unlock()

	e.MoveTargetX = x
	e.MoveTargetY = y
	e.MoveTargetZ = z
	e.IsMoving = true
}

// TakeDamage applies damage to the entity
func (e *Entity) TakeDamage(damage int) bool {
	e.mu.Lock()
	defer e.mu.Unlock()

	e.CombatState.CurrentHealth -= damage
	if e.CombatState.CurrentHealth < 0 {
		e.CombatState.CurrentHealth = 0
	}

	return e.CombatState.CurrentHealth == 0 // returns true if dead
}

// Heal restores health to the entity
func (e *Entity) Heal(amount int) {
	e.mu.Lock()
	defer e.mu.Unlock()

	e.CombatState.CurrentHealth += amount
	if e.CombatState.CurrentHealth > e.CombatState.MaxHealth {
		e.CombatState.CurrentHealth = e.CombatState.MaxHealth
	}
}

// Simple square root approximation (or use math.Sqrt in real implementation)
func sqrt(x float64) float64 {
	// In production, use math.Sqrt
	// Simplified here for demonstration
	if x < 0 {
		return 0
	}
	z := 1.0
	for i := 0; i < 10; i++ {
		z -= (z*z - x) / (2 * z)
	}
	return z
}
