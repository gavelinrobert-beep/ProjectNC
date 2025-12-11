// Package threat implements the threat/aggro management system for NPCs.
// Threat determines which player an NPC targets in combat.
package threat

import (
	"sort"
	"sync"
)

// ThreatTable maintains threat values for a single NPC.
// Players gain threat by dealing damage, healing, or using abilities.
// The player with highest threat is typically the NPC's target.
type ThreatTable struct {
	mu      sync.RWMutex
	entries map[string]float64 // entityID -> threat value
	ownerID string             // The NPC this threat table belongs to
}

// NewThreatTable creates a new threat table for an NPC.
func NewThreatTable(ownerID string) *ThreatTable {
	return &ThreatTable{
		entries: make(map[string]float64),
		ownerID: ownerID,
	}
}

// AddThreat adds threat from a source entity.
// Returns the new total threat for that entity.
func (t *ThreatTable) AddThreat(entityID string, amount float64) float64 {
	t.mu.Lock()
	defer t.mu.Unlock()

	if amount < 0 {
		amount = 0 // No negative threat
	}

	t.entries[entityID] += amount
	return t.entries[entityID]
}

// SetThreat sets the exact threat value for an entity.
func (t *ThreatTable) SetThreat(entityID string, amount float64) {
	t.mu.Lock()
	defer t.mu.Unlock()

	if amount <= 0 {
		delete(t.entries, entityID)
	} else {
		t.entries[entityID] = amount
	}
}

// GetThreat returns the threat value for a specific entity.
func (t *ThreatTable) GetThreat(entityID string) float64 {
	t.mu.RLock()
	defer t.mu.RUnlock()
	return t.entries[entityID]
}

// RemoveThreat removes an entity from the threat table.
func (t *ThreatTable) RemoveThreat(entityID string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	delete(t.entries, entityID)
}

// Clear removes all entries from the threat table.
func (t *ThreatTable) Clear() {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.entries = make(map[string]float64)
}

// ThreatEntry represents a single entry for sorting.
type ThreatEntry struct {
	EntityID    string
	ThreatValue float64
}

// GetHighestThreat returns the entity with the highest threat.
func (t *ThreatTable) GetHighestThreat() ThreatEntry {
	t.mu.RLock()
	defer t.mu.RUnlock()

	var highest ThreatEntry
	for entityID, threat := range t.entries {
		if threat > highest.ThreatValue {
			highest = ThreatEntry{EntityID: entityID, ThreatValue: threat}
		}
	}
	return highest
}

// GetSortedEntries returns all entries sorted by threat (highest first).
func (t *ThreatTable) GetSortedEntries() []ThreatEntry {
	t.mu.RLock()
	defer t.mu.RUnlock()

	entries := make([]ThreatEntry, 0, len(t.entries))
	for entityID, threat := range t.entries {
		entries = append(entries, ThreatEntry{EntityID: entityID, ThreatValue: threat})
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].ThreatValue > entries[j].ThreatValue
	})

	return entries
}

// GetAllEntries returns all entries as a slice.
func (t *ThreatTable) GetAllEntries() []ThreatEntry {
	t.mu.RLock()
	defer t.mu.RUnlock()

	entries := make([]ThreatEntry, 0, len(t.entries))
	for entityID, threat := range t.entries {
		entries = append(entries, ThreatEntry{EntityID: entityID, ThreatValue: threat})
	}
	return entries
}

// HasThreat checks if any entity has threat.
func (t *ThreatTable) HasThreat() bool {
	t.mu.RLock()
	defer t.mu.RUnlock()
	return len(t.entries) > 0
}

// Count returns the number of entities with threat.
func (t *ThreatTable) Count() int {
	t.mu.RLock()
	defer t.mu.RUnlock()
	return len(t.entries)
}

// DecayThreat reduces all threat values by a percentage.
// Used for threat decay over time or when combat ends.
func (t *ThreatTable) DecayThreat(decayPercent float64) {
	t.mu.Lock()
	defer t.mu.Unlock()

	multiplier := 1.0 - decayPercent
	for entityID, threat := range t.entries {
		newThreat := threat * multiplier
		if newThreat < 1.0 {
			delete(t.entries, entityID)
		} else {
			t.entries[entityID] = newThreat
		}
	}
}

// ThreatModifier applies a modifier to an entity's threat.
// Used for tank abilities like "Taunt" (2x threat) or threat reduction.
func (t *ThreatTable) ThreatModifier(entityID string, multiplier float64) {
	t.mu.Lock()
	defer t.mu.Unlock()

	if threat, exists := t.entries[entityID]; exists {
		t.entries[entityID] = threat * multiplier
	}
}

// TransferThreat moves threat from one entity to another.
// Used for abilities like "Misdirection" or "Tricks of the Trade".
func (t *ThreatTable) TransferThreat(fromID, toID string, percent float64) {
	t.mu.Lock()
	defer t.mu.Unlock()

	fromThreat := t.entries[fromID]
	transferAmount := fromThreat * percent

	t.entries[fromID] -= transferAmount
	t.entries[toID] += transferAmount

	// Clean up if threat dropped to zero
	if t.entries[fromID] <= 0 {
		delete(t.entries, fromID)
	}
}

// ThreatManager manages threat tables for all NPCs in the world.
type ThreatManager struct {
	mu     sync.RWMutex
	tables map[string]*ThreatTable // npcID -> ThreatTable
}

// NewThreatManager creates a new threat manager.
func NewThreatManager() *ThreatManager {
	return &ThreatManager{
		tables: make(map[string]*ThreatTable),
	}
}

// GetOrCreateTable gets or creates a threat table for an NPC.
func (m *ThreatManager) GetOrCreateTable(npcID string) *ThreatTable {
	m.mu.Lock()
	defer m.mu.Unlock()

	if table, exists := m.tables[npcID]; exists {
		return table
	}

	table := NewThreatTable(npcID)
	m.tables[npcID] = table
	return table
}

// GetTable returns the threat table for an NPC, or nil if none exists.
func (m *ThreatManager) GetTable(npcID string) *ThreatTable {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.tables[npcID]
}

// RemoveTable removes an NPC's threat table.
func (m *ThreatManager) RemoveTable(npcID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.tables, npcID)
}

// AddThreat adds threat to a specific NPC from a source.
func (m *ThreatManager) AddThreat(npcID, sourceID string, amount float64) float64 {
	table := m.GetOrCreateTable(npcID)
	return table.AddThreat(sourceID, amount)
}

// RemoveEntityFromAll removes an entity from all threat tables.
// Called when a player dies or leaves the area.
func (m *ThreatManager) RemoveEntityFromAll(entityID string) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, table := range m.tables {
		table.RemoveThreat(entityID)
	}
}

// ClearAllTables clears all threat tables.
func (m *ThreatManager) ClearAllTables() {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, table := range m.tables {
		table.Clear()
	}
}

// ========================================
// Threat Calculation Constants
// ========================================

// ThreatMultipliers define how different actions generate threat.
var ThreatMultipliers = struct {
	Damage       float64 // Threat per point of damage dealt
	Healing      float64 // Threat per point of healing done
	Buff         float64 // Threat for applying a buff
	Debuff       float64 // Threat for applying a debuff
	Taunt        float64 // Multiplier for taunt abilities
	Vanish       float64 // Multiplier for vanish/drop threat abilities
	Aggro        float64 // Initial aggro (pulling)
	Resurrection float64 // Threat for resurrecting a player
}{
	Damage:       1.0,
	Healing:      0.5, // Healing generates half the threat of damage
	Buff:         5.0, // Flat threat for buffs
	Debuff:       10.0,
	Taunt:        1.0,   // Taunt sets threat equal to highest + 10%
	Vanish:       0.0,   // Vanish drops all threat
	Aggro:        100.0, // Initial aggro threat
	Resurrection: 500.0,
}

// CalculateDamageThreat calculates threat from damage dealt.
func CalculateDamageThreat(damage int, threatModifier float64) float64 {
	return float64(damage) * ThreatMultipliers.Damage * threatModifier
}

// CalculateHealingThreat calculates threat from healing done.
// Note: Healing threat is split among all engaged NPCs.
func CalculateHealingThreat(healing int, threatModifier float64) float64 {
	return float64(healing) * ThreatMultipliers.Healing * threatModifier
}

// CalculateTauntThreat calculates threat for a taunt ability.
// Taunt sets the taunter's threat to highest + 10%.
func CalculateTauntThreat(currentHighest float64) float64 {
	return currentHighest * 1.1
}
