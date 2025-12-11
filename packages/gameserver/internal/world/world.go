package world

import (
	"sync"

	"github.com/mmorpg/gameserver/internal/entity"
)

// World represents the game world and manages all entities
// This is the authoritative source of truth for game state
type World struct {
	mu       sync.RWMutex
	entities map[string]*entity.Entity
	players  map[string]*entity.Entity // Quick lookup for players
}

// NewWorld creates a new game world
func NewWorld() *World {
	return &World{
		entities: make(map[string]*entity.Entity),
		players:  make(map[string]*entity.Entity),
	}
}

// Update advances the world simulation by one tick
func (w *World) Update(deltaTime float64) {
	w.mu.Lock()
	defer w.mu.Unlock()

	// Update all entities
	// - Movement
	// - Combat state
	// - Cooldowns
	// - AI behavior (for NPCs)
	for _, e := range w.entities {
		e.Update(deltaTime)
	}

	// Process combat events
	// (Simplified for now - full combat system in combat package)
}

// AddPlayer adds a player entity to the world
func (w *World) AddPlayer(player *entity.Entity) {
	w.mu.Lock()
	defer w.mu.Unlock()

	w.entities[player.ID] = player
	w.players[player.ID] = player
}

// RemovePlayer removes a player from the world
func (w *World) RemovePlayer(playerID string) {
	w.mu.Lock()
	defer w.mu.Unlock()

	delete(w.entities, playerID)
	delete(w.players, playerID)
}

// GetEntity gets an entity by ID
func (w *World) GetEntity(entityID string) *entity.Entity {
	w.mu.RLock()
	defer w.mu.RUnlock()

	return w.entities[entityID]
}

// GetNearbyEntities returns entities within a certain range of a position
// This is used for client updates - only send nearby entities to reduce bandwidth
func (w *World) GetNearbyEntities(x, y, z, radius float64) []*entity.Entity {
	w.mu.RLock()
	defer w.mu.RUnlock()

	var nearby []*entity.Entity

	for _, e := range w.entities {
		// Simple distance check (can be optimized with spatial partitioning)
		dx := e.Position.X - x
		dy := e.Position.Y - y
		dz := e.Position.Z - z
		distSq := dx*dx + dy*dy + dz*dz

		if distSq <= radius*radius {
			nearby = append(nearby, e)
		}
	}

	return nearby
}

// GetAllPlayers returns all player entities
func (w *World) GetAllPlayers() []*entity.Entity {
	w.mu.RLock()
	defer w.mu.RUnlock()

	players := make([]*entity.Entity, 0, len(w.players))
	for _, p := range w.players {
		players = append(players, p)
	}

	return players
}
