package behaviortree

import "sync"

// Blackboard is a shared memory system for behavior tree nodes.
// It allows nodes to communicate and share state within a single NPC.
// Each NPC has its own blackboard instance.
//
// Common uses:
// - Storing current target entity ID
// - Tracking patrol waypoints
// - Recording last known enemy position
// - Storing combat state flags
type Blackboard struct {
	mu   sync.RWMutex
	data map[string]interface{}
}

// NewBlackboard creates a new empty blackboard.
func NewBlackboard() *Blackboard {
	return &Blackboard{
		data: make(map[string]interface{}),
	}
}

// Set stores a value in the blackboard.
func (b *Blackboard) Set(key string, value interface{}) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.data[key] = value
}

// Get retrieves a value from the blackboard.
// Returns nil if the key doesn't exist.
func (b *Blackboard) Get(key string) interface{} {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.data[key]
}

// GetString retrieves a string value from the blackboard.
func (b *Blackboard) GetString(key string) (string, bool) {
	val := b.Get(key)
	if val == nil {
		return "", false
	}
	if s, ok := val.(string); ok {
		return s, true
	}
	return "", false
}

// GetFloat retrieves a float64 value from the blackboard.
func (b *Blackboard) GetFloat(key string) (float64, bool) {
	val := b.Get(key)
	if val == nil {
		return 0, false
	}
	if f, ok := val.(float64); ok {
		return f, true
	}
	return 0, false
}

// GetInt retrieves an int value from the blackboard.
func (b *Blackboard) GetInt(key string) (int, bool) {
	val := b.Get(key)
	if val == nil {
		return 0, false
	}
	if i, ok := val.(int); ok {
		return i, true
	}
	return 0, false
}

// GetBool retrieves a bool value from the blackboard.
func (b *Blackboard) GetBool(key string) (bool, bool) {
	val := b.Get(key)
	if val == nil {
		return false, false
	}
	if v, ok := val.(bool); ok {
		return v, true
	}
	return false, false
}

// Has checks if a key exists in the blackboard.
func (b *Blackboard) Has(key string) bool {
	b.mu.RLock()
	defer b.mu.RUnlock()
	_, exists := b.data[key]
	return exists
}

// Delete removes a key from the blackboard.
func (b *Blackboard) Delete(key string) {
	b.mu.Lock()
	defer b.mu.Unlock()
	delete(b.data, key)
}

// Clear removes all data from the blackboard.
func (b *Blackboard) Clear() {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.data = make(map[string]interface{})
}

// Keys returns all keys in the blackboard.
func (b *Blackboard) Keys() []string {
	b.mu.RLock()
	defer b.mu.RUnlock()
	keys := make([]string, 0, len(b.data))
	for k := range b.data {
		keys = append(keys, k)
	}
	return keys
}

// Common blackboard keys used by the AI system.
// Using constants prevents typos and enables IDE autocomplete.
const (
	// Target-related keys
	KeyCurrentTarget    = "current_target"     // string: Entity ID of current target
	KeyTargetPosition   = "target_position"    // Position3D: Last known target position
	KeyAggroList        = "aggro_list"         // []string: List of entity IDs that have aggroed this NPC
	KeyHighestThreat    = "highest_threat"     // string: Entity ID with highest threat
	KeyThreatTable      = "threat_table"       // map[string]float64: Threat values per entity

	// Position-related keys
	KeySpawnPosition    = "spawn_position"     // Position3D: Original spawn point
	KeyHomePosition     = "home_position"      // Position3D: Current home/leash position
	KeyPatrolWaypoints  = "patrol_waypoints"   // []Position3D: Patrol path
	KeyCurrentWaypoint  = "current_waypoint"   // int: Index of current patrol waypoint
	KeyLastSeenPosition = "last_seen_position" // Position3D: Where target was last seen

	// State flags
	KeyIsInCombat       = "is_in_combat"      // bool: Currently fighting
	KeyIsEvading        = "is_evading"        // bool: Returning to home
	KeyIsPatrolling     = "is_patrolling"     // bool: Following patrol path
	KeyIsWandering      = "is_wandering"      // bool: Random movement
	KeyIsFleeing        = "is_fleeing"        // bool: Running away

	// Combat-related keys
	KeyLastAbilityUsed  = "last_ability_used" // string: ID of last ability used
	KeyLastAbilityTime  = "last_ability_time" // int64: Timestamp of last ability
	KeyCombatStartTime  = "combat_start_time" // int64: When combat started
	KeyHealthPercent    = "health_percent"    // float64: Current health percentage

	// Timing
	KeyLastUpdateTime   = "last_update_time"  // int64: Last AI update timestamp
	KeyStateChangeTime  = "state_change_time" // int64: When state last changed
)

// Position3D represents a 3D position for blackboard storage.
type Position3D struct {
	X float64
	Y float64
	Z float64
}
