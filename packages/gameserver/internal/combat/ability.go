package combat

import (
	"time"

	"github.com/mmorpg/gameserver/internal/entity"
)

// Ability represents a skill or spell that can be used in combat
type Ability struct {
	ID          string
	Name        string
	Description string

	ManaCost   int
	Cooldown   int64 // milliseconds
	CastTime   int64 // milliseconds
	Range      float64

	RequiresTarget bool
	CanTargetSelf  bool

	// Damage formula (simplified)
	BaseDamage int
	ScaleStr   float64 // Scale with strength
	ScaleInt   float64 // Scale with intellect
}

// CombatManager handles combat calculations
type CombatManager struct {
	// Ability registry
	abilities map[string]*Ability
}

// NewCombatManager creates a new combat manager
func NewCombatManager() *CombatManager {
	cm := &CombatManager{
		abilities: make(map[string]*Ability),
	}

	// Register default abilities
	cm.registerDefaultAbilities()

	return cm
}

// registerDefaultAbilities adds starter abilities for testing
func (cm *CombatManager) registerDefaultAbilities() {
	// Basic Attack - available to all classes
	cm.abilities["basic_attack"] = &Ability{
		ID:             "basic_attack",
		Name:           "Basic Attack",
		Description:    "A simple melee attack",
		ManaCost:       0,
		Cooldown:       1500, // 1.5 seconds
		CastTime:       0,
		Range:          5.0,
		RequiresTarget: true,
		BaseDamage:     10,
		ScaleStr:       0.5,
	}

	// Firebolt - Mage ability
	cm.abilities["firebolt"] = &Ability{
		ID:             "firebolt",
		Name:           "Firebolt",
		Description:    "Hurls a bolt of fire at the enemy",
		ManaCost:       30,
		Cooldown:       3000, // 3 seconds
		CastTime:       1500, // 1.5 second cast
		Range:          30.0,
		RequiresTarget: true,
		BaseDamage:     50,
		ScaleInt:       1.2,
	}

	// Healing Touch - Priest ability
	cm.abilities["healing_touch"] = &Ability{
		ID:             "healing_touch",
		Name:           "Healing Touch",
		Description:    "Heals a friendly target",
		ManaCost:       40,
		Cooldown:       5000,
		CastTime:       2000,
		Range:          40.0,
		RequiresTarget: true,
		CanTargetSelf:  true,
		BaseDamage:     -80, // Negative damage = healing
		ScaleInt:       1.5,
	}
}

// ExecuteAbility performs ability execution and returns combat event
func (cm *CombatManager) ExecuteAbility(
	abilityID string,
	caster *entity.Entity,
	target *entity.Entity,
) *CombatEvent {
	ability := cm.abilities[abilityID]
	if ability == nil {
		return nil
	}

	// Validate mana cost
	if caster.CombatState.CurrentMana < ability.ManaCost {
		return nil // Not enough mana
	}

	// Check cooldown
	now := time.Now().UnixMilli()
	if cooldownExpiry, exists := caster.Cooldowns[abilityID]; exists {
		if now < cooldownExpiry {
			return nil // Ability on cooldown
		}
	}

	// Validate range (simplified - just check distance)
	dx := caster.Position.X - target.Position.X
	dy := caster.Position.Y - target.Position.Y
	dz := caster.Position.Z - target.Position.Z
	distSq := dx*dx + dy*dy + dz*dz

	if distSq > ability.Range*ability.Range {
		return nil // Target out of range
	}

	// Calculate damage
	damage := cm.calculateDamage(ability, caster)

	// Apply damage or healing
	var isDead bool
	if damage > 0 {
		isDead = target.TakeDamage(damage)
	} else {
		target.Heal(-damage) // Negative damage = healing
	}

	// Consume mana
	caster.CombatState.CurrentMana -= ability.ManaCost

	// Set cooldown
	caster.Cooldowns[abilityID] = now + ability.Cooldown

	// Create combat event
	event := &CombatEvent{
		Type:             EventTypeDamage,
		SourceEntityID:   caster.ID,
		TargetEntityID:   target.ID,
		AbilityID:        abilityID,
		Value:            damage,
		TargetHealth:     target.CombatState.CurrentHealth,
		TargetMaxHealth:  target.CombatState.MaxHealth,
		IsDead:           isDead,
		Timestamp:        now,
	}

	if damage < 0 {
		event.Type = EventTypeHeal
		event.Value = -damage // Convert back to positive for display
	}

	return event
}

// calculateDamage calculates final damage based on ability and caster stats
func (cm *CombatManager) calculateDamage(ability *Ability, caster *entity.Entity) int {
	damage := float64(ability.BaseDamage)

	// Scale with stats
	damage += float64(caster.Stats.Strength) * ability.ScaleStr
	damage += float64(caster.Stats.Intellect) * ability.ScaleInt

	// Future enhancements:
	// - Critical hits (based on agility)
	// - Armor mitigation
	// - Buffs/debuffs
	// - Weapon damage
	// - Resistance

	return int(damage)
}

// GetAbility returns an ability by ID
func (cm *CombatManager) GetAbility(id string) *Ability {
	return cm.abilities[id]
}
