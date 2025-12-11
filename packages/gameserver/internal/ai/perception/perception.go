// Package perception implements the sensory system for NPCs.
// It handles detection of nearby entities, line of sight, and faction relationships.
package perception

import (
	"math"
	"sync"
)

// Faction represents a faction in the game world.
// Factions determine default hostility between entities.
type Faction string

const (
	FactionNeutral   Faction = "NEUTRAL"    // Neutral to all unless attacked
	FactionHostile   Faction = "HOSTILE"    // Hostile to players
	FactionFriendly  Faction = "FRIENDLY"   // Friendly to players
	FactionWildlife  Faction = "WILDLIFE"   // Passive animals
	FactionBandit    Faction = "BANDIT"     // Hostile humanoids
	FactionUndead    Faction = "UNDEAD"     // Undead creatures
	FactionDemon     Faction = "DEMON"      // Demonic creatures
	FactionAlliance  Faction = "ALLIANCE"   // Alliance players
	FactionHorde     Faction = "HORDE"      // Horde players
)

// EntityType for perception (simplified from entity package to avoid circular import)
type EntityType string

const (
	EntityTypePlayer  EntityType = "PLAYER"
	EntityTypeNPC     EntityType = "NPC"
	EntityTypeMonster EntityType = "MONSTER"
)

// PerceptionConfig configures an NPC's sensory capabilities.
type PerceptionConfig struct {
	// Vision range in units (how far the NPC can see)
	VisionRange float64

	// Vision angle in degrees (field of view, 360 = all around)
	VisionAngle float64

	// Aggro radius - distance at which NPC will engage enemies
	AggroRadius float64

	// Leash radius - distance from spawn before NPC resets
	LeashRadius float64

	// Whether the NPC can see through walls (false for realistic LOS)
	IgnoreLineOfSight bool

	// Detection delay in milliseconds (time before detection triggers aggro)
	DetectionDelay int64

	// Stealth detection modifier (higher = better at detecting stealthed units)
	StealthDetection float64
}

// DefaultPerceptionConfig returns a standard perception configuration.
func DefaultPerceptionConfig() PerceptionConfig {
	return PerceptionConfig{
		VisionRange:       30.0,
		VisionAngle:       120.0,
		AggroRadius:       15.0,
		LeashRadius:       40.0,
		IgnoreLineOfSight: false,
		DetectionDelay:    0,
		StealthDetection:  1.0,
	}
}

// PerceivedEntity represents an entity detected by the perception system.
type PerceivedEntity struct {
	EntityID   string
	EntityType EntityType
	Faction    Faction
	Distance   float64
	Angle      float64 // Angle from NPC's forward direction
	IsVisible  bool    // True if within vision cone and LOS
	IsInAggro  bool    // True if within aggro radius
	ThreatLevel float64 // Calculated threat level
	DetectedAt int64   // Timestamp when first detected
}

// PerceptionSystem handles sensory detection for an NPC.
type PerceptionSystem struct {
	mu sync.RWMutex

	Config     PerceptionConfig
	Faction    Faction
	Position   Position
	Rotation   float64 // Facing direction in radians

	// Cached perceived entities
	perceived    map[string]*PerceivedEntity
	lastUpdateMs int64

	// Faction hostility matrix
	hostilityMatrix map[Faction]map[Faction]bool
}

// Position represents a 3D position.
type Position struct {
	X, Y, Z float64
}

// NewPerceptionSystem creates a new perception system with the given config.
func NewPerceptionSystem(config PerceptionConfig, faction Faction) *PerceptionSystem {
	ps := &PerceptionSystem{
		Config:          config,
		Faction:         faction,
		perceived:       make(map[string]*PerceivedEntity),
		hostilityMatrix: buildDefaultHostilityMatrix(),
	}
	return ps
}

// buildDefaultHostilityMatrix creates the default faction relationships.
func buildDefaultHostilityMatrix() map[Faction]map[Faction]bool {
	matrix := make(map[Faction]map[Faction]bool)

	// Initialize all factions
	factions := []Faction{
		FactionNeutral, FactionHostile, FactionFriendly,
		FactionWildlife, FactionBandit, FactionUndead,
		FactionDemon, FactionAlliance, FactionHorde,
	}

	for _, f := range factions {
		matrix[f] = make(map[Faction]bool)
	}

	// Hostile faction is hostile to players
	matrix[FactionHostile][FactionAlliance] = true
	matrix[FactionHostile][FactionHorde] = true

	// Bandits are hostile to everyone except other bandits
	matrix[FactionBandit][FactionAlliance] = true
	matrix[FactionBandit][FactionHorde] = true
	matrix[FactionBandit][FactionFriendly] = true

	// Undead are hostile to all living
	matrix[FactionUndead][FactionAlliance] = true
	matrix[FactionUndead][FactionHorde] = true
	matrix[FactionUndead][FactionFriendly] = true
	matrix[FactionUndead][FactionNeutral] = true

	// Demons are hostile to everyone
	matrix[FactionDemon][FactionAlliance] = true
	matrix[FactionDemon][FactionHorde] = true
	matrix[FactionDemon][FactionFriendly] = true
	matrix[FactionDemon][FactionNeutral] = true
	matrix[FactionDemon][FactionWildlife] = true

	// Alliance and Horde may be hostile to each other (PvP)
	// This is configurable per server

	return matrix
}

// UpdatePosition updates the NPC's position and rotation.
func (ps *PerceptionSystem) UpdatePosition(x, y, z, rotation float64) {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	ps.Position = Position{X: x, Y: y, Z: z}
	ps.Rotation = rotation
}

// ProcessEntities updates perception based on nearby entities.
// Returns list of newly detected hostile entities.
func (ps *PerceptionSystem) ProcessEntities(
	currentTimeMs int64,
	nearbyEntities []EntityInfo,
	losChecker func(x1, y1, z1, x2, y2, z2 float64) bool,
) []string {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	ps.lastUpdateMs = currentTimeMs
	newlyDetected := []string{}

	// Track which entities are still visible
	stillVisible := make(map[string]bool)

	for _, entity := range nearbyEntities {
		// Calculate distance
		dx := entity.X - ps.Position.X
		dy := entity.Y - ps.Position.Y
		dz := entity.Z - ps.Position.Z
		distance := math.Sqrt(dx*dx + dy*dy + dz*dz)

		// Skip if outside vision range
		if distance > ps.Config.VisionRange {
			continue
		}

		// Calculate angle from forward direction
		angle := ps.calculateAngle(dx, dy)

		// Check if within vision cone
		halfAngle := ps.Config.VisionAngle / 2.0 * (math.Pi / 180.0)
		inVisionCone := math.Abs(angle) <= halfAngle || ps.Config.VisionAngle >= 360.0

		// Check line of sight
		hasLOS := ps.Config.IgnoreLineOfSight
		if !hasLOS && losChecker != nil {
			hasLOS = losChecker(
				ps.Position.X, ps.Position.Y, ps.Position.Z,
				entity.X, entity.Y, entity.Z,
			)
		} else if losChecker == nil {
			hasLOS = true // Assume LOS if no checker provided
		}

		isVisible := inVisionCone && hasLOS
		isInAggro := distance <= ps.Config.AggroRadius && isVisible

		// Check if hostile
		isHostile := ps.IsHostileTo(entity.Faction)

		// Get or create perceived entity
		perceived, exists := ps.perceived[entity.ID]
		if !exists {
			perceived = &PerceivedEntity{
				EntityID:   entity.ID,
				EntityType: entity.Type,
				Faction:    entity.Faction,
				DetectedAt: currentTimeMs,
			}
			ps.perceived[entity.ID] = perceived

			// Track newly detected hostile entities
			if isHostile && isInAggro {
				newlyDetected = append(newlyDetected, entity.ID)
			}
		}

		// Update perceived entity data
		perceived.Distance = distance
		perceived.Angle = angle
		perceived.IsVisible = isVisible
		perceived.IsInAggro = isInAggro
		perceived.ThreatLevel = ps.calculateThreatLevel(entity, distance, isHostile)

		stillVisible[entity.ID] = true
	}

	// Remove entities that are no longer visible
	for id := range ps.perceived {
		if !stillVisible[id] {
			delete(ps.perceived, id)
		}
	}

	return newlyDetected
}

// EntityInfo contains information about a nearby entity for perception processing.
type EntityInfo struct {
	ID      string
	Type    EntityType
	Faction Faction
	X, Y, Z float64
	Level   int
	Health  float64
	MaxHealth float64
}

// calculateAngle calculates the angle from the NPC's forward direction to a point.
func (ps *PerceptionSystem) calculateAngle(dx, dy float64) float64 {
	// Calculate angle to target
	targetAngle := math.Atan2(dy, dx)

	// Normalize relative to NPC's rotation
	relativeAngle := targetAngle - ps.Rotation

	// Normalize to [-π, π]
	for relativeAngle > math.Pi {
		relativeAngle -= 2 * math.Pi
	}
	for relativeAngle < -math.Pi {
		relativeAngle += 2 * math.Pi
	}

	return relativeAngle
}

// calculateThreatLevel calculates a threat value for an entity.
func (ps *PerceptionSystem) calculateThreatLevel(entity EntityInfo, distance float64, isHostile bool) float64 {
	if !isHostile {
		return 0
	}

	// Base threat on proximity (closer = more threatening)
	distanceFactor := 1.0 - (distance / ps.Config.VisionRange)
	if distanceFactor < 0 {
		distanceFactor = 0
	}

	// Players are generally more threatening
	typeFactor := 1.0
	if entity.Type == EntityTypePlayer {
		typeFactor = 2.0
	}

	// Low health targets are less threatening
	healthFactor := 1.0
	if entity.MaxHealth > 0 {
		healthFactor = entity.Health / entity.MaxHealth
	}

	return distanceFactor * typeFactor * healthFactor
}

// IsHostileTo checks if this NPC is hostile to the given faction.
func (ps *PerceptionSystem) IsHostileTo(faction Faction) bool {
	if hostileMap, exists := ps.hostilityMatrix[ps.Faction]; exists {
		return hostileMap[faction]
	}
	return false
}

// GetPerceivedEntities returns all currently perceived entities.
func (ps *PerceptionSystem) GetPerceivedEntities() []*PerceivedEntity {
	ps.mu.RLock()
	defer ps.mu.RUnlock()

	result := make([]*PerceivedEntity, 0, len(ps.perceived))
	for _, p := range ps.perceived {
		result = append(result, p)
	}
	return result
}

// GetNearestHostile returns the nearest hostile entity in aggro range.
func (ps *PerceptionSystem) GetNearestHostile() *PerceivedEntity {
	ps.mu.RLock()
	defer ps.mu.RUnlock()

	var nearest *PerceivedEntity
	nearestDist := math.MaxFloat64

	for _, p := range ps.perceived {
		if !p.IsInAggro {
			continue
		}
		if !ps.IsHostileTo(p.Faction) {
			continue
		}
		if p.Distance < nearestDist {
			nearest = p
			nearestDist = p.Distance
		}
	}

	return nearest
}

// GetHighestThreat returns the entity with the highest threat level.
func (ps *PerceptionSystem) GetHighestThreat() *PerceivedEntity {
	ps.mu.RLock()
	defer ps.mu.RUnlock()

	var highest *PerceivedEntity
	highestThreat := 0.0

	for _, p := range ps.perceived {
		if p.ThreatLevel > highestThreat {
			highest = p
			highestThreat = p.ThreatLevel
		}
	}

	return highest
}

// IsEntityPerceived checks if an entity is currently perceived.
func (ps *PerceptionSystem) IsEntityPerceived(entityID string) bool {
	ps.mu.RLock()
	defer ps.mu.RUnlock()
	_, exists := ps.perceived[entityID]
	return exists
}

// GetPerceivedEntity returns a specific perceived entity by ID.
func (ps *PerceptionSystem) GetPerceivedEntity(entityID string) *PerceivedEntity {
	ps.mu.RLock()
	defer ps.mu.RUnlock()
	return ps.perceived[entityID]
}

// ClearPerception clears all perceived entities.
func (ps *PerceptionSystem) ClearPerception() {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	ps.perceived = make(map[string]*PerceivedEntity)
}

// SetHostility sets custom hostility between factions.
func (ps *PerceptionSystem) SetHostility(from, to Faction, hostile bool) {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	if ps.hostilityMatrix[from] == nil {
		ps.hostilityMatrix[from] = make(map[Faction]bool)
	}
	ps.hostilityMatrix[from][to] = hostile
}
