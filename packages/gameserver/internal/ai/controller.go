// Package ai provides the main AI controller and update system for NPCs.
// This file contains the core AI infrastructure that integrates all AI subsystems.
package ai

import (
	"sync"
	"time"

	"github.com/mmorpg/gameserver/internal/ai/behaviortree"
	"github.com/mmorpg/gameserver/internal/ai/perception"
	"github.com/mmorpg/gameserver/internal/ai/templates"
	"github.com/mmorpg/gameserver/internal/ai/threat"
)

// AIController manages the AI state and behavior for a single NPC.
// Each NPC has its own AIController instance.
type AIController struct {
	mu sync.RWMutex

	// Identity
	EntityID   string
	TemplateID string

	// Components
	Blackboard   *behaviortree.Blackboard
	BehaviorTree behaviortree.Node
	Perception   *perception.PerceptionSystem
	ThreatTable  *threat.ThreatTable

	// State
	IsActive     bool
	IsSleeping   bool
	LastUpdateMs int64

	// Configuration
	Template *templates.NPCTemplate

	// Cached references
	worldQuery   behaviortree.WorldQueryInterface
	combatIface  behaviortree.CombatInterface
}

// NewAIController creates a new AI controller for an NPC.
func NewAIController(
	entityID string,
	template *templates.NPCTemplate,
	spawnX, spawnY, spawnZ float64,
	worldQuery behaviortree.WorldQueryInterface,
	combatIface behaviortree.CombatInterface,
) *AIController {
	// Create blackboard and initialize with spawn position
	blackboard := behaviortree.NewBlackboard()
	spawnPos := behaviortree.Position3D{X: spawnX, Y: spawnY, Z: spawnZ}
	blackboard.Set(behaviortree.KeySpawnPosition, spawnPos)
	blackboard.Set(behaviortree.KeyHomePosition, spawnPos)

	// Create perception system
	perceptionSys := perception.NewPerceptionSystem(
		template.PerceptionConfig,
		template.Faction,
	)
	perceptionSys.UpdatePosition(spawnX, spawnY, spawnZ, 0)

	// Create threat table
	threatTable := threat.NewThreatTable(entityID)

	// Build behavior tree
	behaviorTree := templates.GetBehaviorTree(template)

	return &AIController{
		EntityID:     entityID,
		Template:     template,
		Blackboard:   blackboard,
		BehaviorTree: behaviorTree,
		Perception:   perceptionSys,
		ThreatTable:  threatTable,
		IsActive:     true,
		IsSleeping:   false,
		worldQuery:   worldQuery,
		combatIface:  combatIface,
	}
}

// Update runs one AI tick for this NPC.
func (c *AIController) Update(currentTimeMs int64, deltaTime float64) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if !c.IsActive || c.IsSleeping {
		return
	}

	c.LastUpdateMs = currentTimeMs

	// Update perception
	c.updatePerception(currentTimeMs)

	// Update health percentage in blackboard
	c.updateHealthPercent()

	// Create behavior tree context
	ctx := &behaviortree.Context{
		EntityID:        c.EntityID,
		Blackboard:      c.Blackboard,
		DeltaTime:       deltaTime,
		CurrentTime:     currentTimeMs,
		WorldQuery:      c.worldQuery,
		CombatInterface: c.combatIface,
	}

	// Execute behavior tree
	c.BehaviorTree.Execute(ctx)
}

// updatePerception updates the perception system with nearby entities.
func (c *AIController) updatePerception(currentTimeMs int64) {
	if c.worldQuery == nil {
		return
	}

	// Get current position
	x, y, z, ok := c.worldQuery.GetEntityPosition(c.EntityID)
	if !ok {
		return
	}

	// Update perception position
	c.Perception.UpdatePosition(x, y, z, 0) // TODO: Get rotation

	// Get nearby entities from world query
	nearbyIDs := c.worldQuery.GetEntitiesInRadius(x, y, z, c.Template.PerceptionConfig.VisionRange)

	// Convert to EntityInfo slice
	nearbyEntities := make([]perception.EntityInfo, 0, len(nearbyIDs))
	for _, id := range nearbyIDs {
		if id == c.EntityID {
			continue // Skip self
		}

		ex, ey, ez, ok := c.worldQuery.GetEntityPosition(id)
		if !ok {
			continue
		}

		// Get entity data - for now assume all are hostile players
		// TODO: Get actual entity type and faction from world query
		nearbyEntities = append(nearbyEntities, perception.EntityInfo{
			ID:      id,
			Type:    perception.EntityTypePlayer,
			Faction: perception.FactionAlliance, // Assume player faction
			X:       ex,
			Y:       ey,
			Z:       ez,
		})
	}

	// Process perception (line of sight check placeholder)
	newlyDetected := c.Perception.ProcessEntities(currentTimeMs, nearbyEntities, nil)

	// Add threat for newly detected hostile entities
	for _, entityID := range newlyDetected {
		c.ThreatTable.AddThreat(entityID, threat.ThreatMultipliers.Aggro)
		// Set as target if no current target
		if !c.Blackboard.Has(behaviortree.KeyCurrentTarget) {
			c.Blackboard.Set(behaviortree.KeyCurrentTarget, entityID)
			c.Blackboard.Set(behaviortree.KeyIsInCombat, true)
		}
	}
}

// updateHealthPercent calculates and stores health percentage.
func (c *AIController) updateHealthPercent() {
	// This would normally get health from the entity
	// For now, set to 100% if not in threat
	if !c.ThreatTable.HasThreat() {
		c.Blackboard.Set(behaviortree.KeyHealthPercent, 1.0)
	}
	// Health tracking would be integrated with entity system
}

// Sleep puts the AI to sleep (for distant NPCs).
func (c *AIController) Sleep() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.IsSleeping = true
}

// Wake wakes the AI from sleep.
func (c *AIController) Wake() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.IsSleeping = false
}

// Reset resets the AI to its initial state.
func (c *AIController) Reset() {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Clear threat
	c.ThreatTable.Clear()

	// Clear combat state
	c.Blackboard.Delete(behaviortree.KeyCurrentTarget)
	c.Blackboard.Set(behaviortree.KeyIsInCombat, false)
	c.Blackboard.Set(behaviortree.KeyIsEvading, false)
	c.Blackboard.Set(behaviortree.KeyHealthPercent, 1.0)

	// Reset behavior tree
	c.BehaviorTree.Reset()

	// Clear perception
	c.Perception.ClearPerception()
}

// AddThreat adds threat from a source entity.
func (c *AIController) AddThreat(sourceID string, amount float64) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.ThreatTable.AddThreat(sourceID, amount)

	// Enter combat if not already
	if !c.Blackboard.Has(behaviortree.KeyCurrentTarget) {
		c.Blackboard.Set(behaviortree.KeyCurrentTarget, sourceID)
	}
	c.Blackboard.Set(behaviortree.KeyIsInCombat, true)
}

// GetMoveTarget returns the current movement target if any.
func (c *AIController) GetMoveTarget() (x, z float64, hasTarget bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	mx, okX := c.Blackboard.GetFloat("move_target_x")
	mz, okZ := c.Blackboard.GetFloat("move_target_z")

	if okX && okZ {
		return mx, mz, true
	}
	return 0, 0, false
}

// ========================================
// AIUpdateSystem - Manages all AI updates
// ========================================

// AIUpdateSystem manages AI updates for all NPCs in the game world.
// It handles activation/deactivation based on player proximity.
type AIUpdateSystem struct {
	mu sync.RWMutex

	// All AI controllers
	controllers map[string]*AIController

	// Configuration
	config AISystemConfig

	// References
	worldQuery  behaviortree.WorldQueryInterface
	combatIface behaviortree.CombatInterface

	// Performance tracking
	lastFullUpdate int64
	activeCount    int
	sleepingCount  int
}

// AISystemConfig configures the AI update system.
type AISystemConfig struct {
	// MaxActiveDistance is the maximum distance from any player for AI to be active
	MaxActiveDistance float64

	// SleepDistance is the distance at which AI goes to sleep
	SleepDistance float64

	// WakeDistance is the distance at which sleeping AI wakes up
	WakeDistance float64

	// DistanceCheckInterval is how often to check distances (milliseconds)
	DistanceCheckInterval int64

	// MaxUpdatesPerTick limits updates per tick for performance
	MaxUpdatesPerTick int
}

// DefaultAISystemConfig returns default configuration.
func DefaultAISystemConfig() AISystemConfig {
	return AISystemConfig{
		MaxActiveDistance:     100.0,
		SleepDistance:         80.0,
		WakeDistance:          60.0,
		DistanceCheckInterval: 1000, // Check every second
		MaxUpdatesPerTick:     100,
	}
}

// NewAIUpdateSystem creates a new AI update system.
func NewAIUpdateSystem(
	config AISystemConfig,
	worldQuery behaviortree.WorldQueryInterface,
	combatIface behaviortree.CombatInterface,
) *AIUpdateSystem {
	return &AIUpdateSystem{
		controllers: make(map[string]*AIController),
		config:      config,
		worldQuery:  worldQuery,
		combatIface: combatIface,
	}
}

// RegisterNPC creates and registers an AI controller for an NPC.
func (s *AIUpdateSystem) RegisterNPC(
	entityID string,
	template *templates.NPCTemplate,
	x, y, z float64,
) *AIController {
	s.mu.Lock()
	defer s.mu.Unlock()

	controller := NewAIController(entityID, template, x, y, z, s.worldQuery, s.combatIface)
	s.controllers[entityID] = controller

	return controller
}

// UnregisterNPC removes an NPC from the AI system.
func (s *AIUpdateSystem) UnregisterNPC(entityID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.controllers, entityID)
}

// GetController returns the AI controller for an NPC.
func (s *AIUpdateSystem) GetController(entityID string) *AIController {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.controllers[entityID]
}

// Update runs one tick of the AI system.
func (s *AIUpdateSystem) Update(currentTimeMs int64, deltaTime float64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if we need to update active/sleeping status
	if currentTimeMs-s.lastFullUpdate >= s.config.DistanceCheckInterval {
		s.updateActivationStatus(currentTimeMs)
		s.lastFullUpdate = currentTimeMs
	}

	// Update active controllers
	updatedCount := 0
	for _, controller := range s.controllers {
		if !controller.IsActive || controller.IsSleeping {
			continue
		}

		controller.Update(currentTimeMs, deltaTime)
		updatedCount++

		// Limit updates per tick for performance
		if s.config.MaxUpdatesPerTick > 0 && updatedCount >= s.config.MaxUpdatesPerTick {
			break
		}
	}
}

// updateActivationStatus updates sleep/wake status based on player proximity.
func (s *AIUpdateSystem) updateActivationStatus(currentTimeMs int64) {
	// Get all player positions
	// This would use the world query to get player positions
	// For now, we'll skip this check and keep all NPCs active

	s.activeCount = 0
	s.sleepingCount = 0

	for _, controller := range s.controllers {
		if controller.IsSleeping {
			s.sleepingCount++
		} else {
			s.activeCount++
		}
	}

	// TODO: Implement distance-based activation
	// 1. Get nearby player positions
	// 2. For each NPC, find minimum distance to any player
	// 3. Sleep if distance > SleepDistance
	// 4. Wake if distance < WakeDistance
}

// GetStats returns performance statistics.
func (s *AIUpdateSystem) GetStats() AISystemStats {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return AISystemStats{
		TotalNPCs:     len(s.controllers),
		ActiveNPCs:    s.activeCount,
		SleepingNPCs:  s.sleepingCount,
		LastUpdateMs:  s.lastFullUpdate,
	}
}

// AISystemStats holds performance statistics.
type AISystemStats struct {
	TotalNPCs    int
	ActiveNPCs   int
	SleepingNPCs int
	LastUpdateMs int64
}

// ========================================
// Combat Interface Implementation
// ========================================

// DefaultCombatInterface provides a basic implementation of CombatInterface.
// This would be replaced with the actual combat system integration.
type DefaultCombatInterface struct {
	threatManager *threat.ThreatManager
}

// NewDefaultCombatInterface creates a new default combat interface.
func NewDefaultCombatInterface() *DefaultCombatInterface {
	return &DefaultCombatInterface{
		threatManager: threat.NewThreatManager(),
	}
}

// ExecuteAbility attempts to use an ability against a target.
func (c *DefaultCombatInterface) ExecuteAbility(casterID, targetID, abilityID string) bool {
	// This would integrate with the actual combat system
	// For now, return success
	return true
}

// GetThreatTable returns the threat entries for an NPC.
func (c *DefaultCombatInterface) GetThreatTable(entityID string) []behaviortree.ThreatEntry {
	table := c.threatManager.GetTable(entityID)
	if table == nil {
		return nil
	}

	entries := table.GetAllEntries()
	result := make([]behaviortree.ThreatEntry, len(entries))
	for i, e := range entries {
		result[i] = behaviortree.ThreatEntry{
			EntityID:    e.EntityID,
			ThreatValue: e.ThreatValue,
		}
	}
	return result
}

// AddThreat adds threat from a source to an NPC.
func (c *DefaultCombatInterface) AddThreat(npcID, sourceID string, amount float64) {
	c.threatManager.AddThreat(npcID, sourceID, amount)
}

// GetThreatManager returns the threat manager for direct access.
func (c *DefaultCombatInterface) GetThreatManager() *threat.ThreatManager {
	return c.threatManager
}

// ========================================
// World Query Placeholder
// ========================================

// PlaceholderWorldQuery provides a basic implementation for testing.
type PlaceholderWorldQuery struct {
	positions map[string]struct{ x, y, z float64 }
}

// NewPlaceholderWorldQuery creates a placeholder world query.
func NewPlaceholderWorldQuery() *PlaceholderWorldQuery {
	return &PlaceholderWorldQuery{
		positions: make(map[string]struct{ x, y, z float64 }),
	}
}

// SetPosition sets an entity's position.
func (w *PlaceholderWorldQuery) SetPosition(entityID string, x, y, z float64) {
	w.positions[entityID] = struct{ x, y, z float64 }{x, y, z}
}

// GetEntityPosition returns the position of an entity.
func (w *PlaceholderWorldQuery) GetEntityPosition(entityID string) (x, y, z float64, ok bool) {
	pos, exists := w.positions[entityID]
	if !exists {
		return 0, 0, 0, false
	}
	return pos.x, pos.y, pos.z, true
}

// GetEntitiesInRadius returns entity IDs within a radius.
func (w *PlaceholderWorldQuery) GetEntitiesInRadius(x, y, z, radius float64) []string {
	// Simple implementation - check all entities
	result := []string{}
	radiusSq := radius * radius

	for id, pos := range w.positions {
		dx := pos.x - x
		dy := pos.y - y
		dz := pos.z - z
		distSq := dx*dx + dy*dy + dz*dz

		if distSq <= radiusSq {
			result = append(result, id)
		}
	}

	return result
}

// GetEntityByID returns entity data by ID.
func (w *PlaceholderWorldQuery) GetEntityByID(entityID string) interface{} {
	pos, exists := w.positions[entityID]
	if !exists {
		return nil
	}
	return pos
}

// IsLineOfSight checks if there's clear line of sight between two points.
func (w *PlaceholderWorldQuery) IsLineOfSight(x1, y1, z1, x2, y2, z2 float64) bool {
	// Placeholder - assume clear line of sight
	return true
}

// ========================================
// Helper Functions
// ========================================

// GetCurrentTimeMs returns the current time in milliseconds.
func GetCurrentTimeMs() int64 {
	return time.Now().UnixMilli()
}
