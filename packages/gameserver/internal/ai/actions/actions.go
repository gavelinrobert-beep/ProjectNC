// Package actions provides behavior tree action nodes for NPC behaviors.
// Actions are leaf nodes that perform actual game actions like movement and combat.
package actions

import (
	"math"

	bt "github.com/mmorpg/gameserver/internal/ai/behaviortree"
)

// ========================================
// Movement Actions
// ========================================

// WanderAction causes the NPC to wander randomly within a radius.
// The NPC picks a random point within wanderRadius of its home position.
type WanderAction struct {
	bt.BaseNode
	WanderRadius   float64
	MinWaitMs      int64
	MaxWaitMs      int64
	randFloat      func() float64 // Injected random for testing
	isWandering    bool
	targetX        float64
	targetZ        float64
	waitUntil      int64
	isWaiting      bool
}

// NewWanderAction creates a new wander action.
func NewWanderAction(name string, wanderRadius float64, minWaitMs, maxWaitMs int64, randFloat func() float64) *WanderAction {
	return &WanderAction{
		BaseNode:     bt.BaseNode{Name: name},
		WanderRadius: wanderRadius,
		MinWaitMs:    minWaitMs,
		MaxWaitMs:    maxWaitMs,
		randFloat:    randFloat,
	}
}

// Execute performs the wander behavior.
func (w *WanderAction) Execute(ctx *bt.Context) bt.NodeStatus {
	// Get home position from blackboard
	homePos, ok := ctx.Blackboard.Get(bt.KeyHomePosition).(bt.Position3D)
	if !ok {
		return bt.StatusFailure
	}

	// If waiting between wanders, check if wait is complete
	if w.isWaiting {
		if ctx.CurrentTime < w.waitUntil {
			return bt.StatusRunning
		}
		w.isWaiting = false
		w.isWandering = false
	}

	// If not currently wandering, pick a new target
	if !w.isWandering {
		// Pick random point within radius
		angle := w.randFloat() * 2 * math.Pi
		distance := w.randFloat() * w.WanderRadius

		w.targetX = homePos.X + math.Cos(angle)*distance
		w.targetZ = homePos.Z + math.Sin(angle)*distance
		w.isWandering = true

		// Store target in blackboard for movement system
		ctx.Blackboard.Set("move_target_x", w.targetX)
		ctx.Blackboard.Set("move_target_z", w.targetZ)
	}

	// Check if we've reached the target
	currentX, currentY, currentZ, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	dx := w.targetX - currentX
	dz := w.targetZ - currentZ
	dist := math.Sqrt(dx*dx + dz*dz)

	if dist < 0.5 {
		// Reached target, start waiting
		w.isWaiting = true
		waitDuration := w.MinWaitMs + int64(w.randFloat()*float64(w.MaxWaitMs-w.MinWaitMs))
		w.waitUntil = ctx.CurrentTime + waitDuration

		// Clear move target
		ctx.Blackboard.Delete("move_target_x")
		ctx.Blackboard.Delete("move_target_z")

		return bt.StatusRunning
	}

	// Store current position for display purposes
	_ = currentY // Y is for vertical position, stored but not used in 2D wander

	return bt.StatusRunning
}

// Reset clears the wander state.
func (w *WanderAction) Reset() {
	w.isWandering = false
	w.isWaiting = false
}

// ChaseTargetAction moves the NPC toward its current target.
type ChaseTargetAction struct {
	bt.BaseNode
	StopDistance float64 // Distance at which to stop chasing
	MaxChaseTime int64   // Maximum chase duration in milliseconds
	startTime    int64
	isChasing    bool
}

// NewChaseTargetAction creates a new chase action.
func NewChaseTargetAction(name string, stopDistance float64, maxChaseTimeMs int64) *ChaseTargetAction {
	return &ChaseTargetAction{
		BaseNode:     bt.BaseNode{Name: name},
		StopDistance: stopDistance,
		MaxChaseTime: maxChaseTimeMs,
	}
}

// Execute moves toward the current target.
func (c *ChaseTargetAction) Execute(ctx *bt.Context) bt.NodeStatus {
	// Get target from blackboard
	targetID, ok := ctx.Blackboard.GetString(bt.KeyCurrentTarget)
	if !ok || targetID == "" {
		return bt.StatusFailure
	}

	// Get target position
	targetX, _, targetZ, ok := ctx.WorldQuery.GetEntityPosition(targetID)
	if !ok {
		// Target no longer exists
		ctx.Blackboard.Delete(bt.KeyCurrentTarget)
		return bt.StatusFailure
	}

	// Get our position
	currentX, _, currentZ, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	// Check if we're within stop distance
	dx := targetX - currentX
	dz := targetZ - currentZ
	dist := math.Sqrt(dx*dx + dz*dz)

	if dist <= c.StopDistance {
		c.Reset()
		return bt.StatusSuccess
	}

	// Start chase timer
	if !c.isChasing {
		c.startTime = ctx.CurrentTime
		c.isChasing = true
	}

	// Check chase timeout
	if c.MaxChaseTime > 0 && ctx.CurrentTime-c.startTime > c.MaxChaseTime {
		c.Reset()
		return bt.StatusFailure
	}

	// Set move target
	ctx.Blackboard.Set("move_target_x", targetX)
	ctx.Blackboard.Set("move_target_z", targetZ)

	return bt.StatusRunning
}

// Reset clears the chase state.
func (c *ChaseTargetAction) Reset() {
	c.isChasing = false
	c.startTime = 0
}

// ReturnToSpawnAction makes the NPC return to its spawn point.
type ReturnToSpawnAction struct {
	bt.BaseNode
	arrivalThreshold float64
}

// NewReturnToSpawnAction creates a new return to spawn action.
func NewReturnToSpawnAction(name string, arrivalThreshold float64) *ReturnToSpawnAction {
	return &ReturnToSpawnAction{
		BaseNode:         bt.BaseNode{Name: name},
		arrivalThreshold: arrivalThreshold,
	}
}

// Execute moves the NPC back to its spawn point.
func (r *ReturnToSpawnAction) Execute(ctx *bt.Context) bt.NodeStatus {
	// Get spawn position
	spawnPos, ok := ctx.Blackboard.Get(bt.KeySpawnPosition).(bt.Position3D)
	if !ok {
		return bt.StatusFailure
	}

	// Get current position
	currentX, _, currentZ, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	// Check if we've arrived
	dx := spawnPos.X - currentX
	dz := spawnPos.Z - currentZ
	dist := math.Sqrt(dx*dx + dz*dz)

	if dist <= r.arrivalThreshold {
		// Clear evading flag
		ctx.Blackboard.Set(bt.KeyIsEvading, false)
		// Restore home position
		ctx.Blackboard.Set(bt.KeyHomePosition, spawnPos)
		return bt.StatusSuccess
	}

	// Set move target
	ctx.Blackboard.Set("move_target_x", spawnPos.X)
	ctx.Blackboard.Set("move_target_z", spawnPos.Z)
	ctx.Blackboard.Set(bt.KeyIsEvading, true)

	return bt.StatusRunning
}

// PatrolAction follows a patrol path of waypoints.
type PatrolAction struct {
	bt.BaseNode
	Waypoints        []bt.Position3D
	WaitAtWaypoint   int64 // Time to wait at each waypoint in milliseconds
	Loop             bool  // Whether to loop the patrol
	currentWaypoint  int
	isWaiting        bool
	waitUntil        int64
}

// NewPatrolAction creates a new patrol action.
func NewPatrolAction(name string, waypoints []bt.Position3D, waitMs int64, loop bool) *PatrolAction {
	return &PatrolAction{
		BaseNode:       bt.BaseNode{Name: name},
		Waypoints:      waypoints,
		WaitAtWaypoint: waitMs,
		Loop:           loop,
	}
}

// Execute follows the patrol path.
func (p *PatrolAction) Execute(ctx *bt.Context) bt.NodeStatus {
	if len(p.Waypoints) == 0 {
		return bt.StatusFailure
	}

	// If waiting at waypoint, check if wait is complete
	if p.isWaiting {
		if ctx.CurrentTime < p.waitUntil {
			return bt.StatusRunning
		}
		p.isWaiting = false
		p.currentWaypoint++

		// Check if patrol complete
		if p.currentWaypoint >= len(p.Waypoints) {
			if p.Loop {
				p.currentWaypoint = 0
			} else {
				p.Reset()
				return bt.StatusSuccess
			}
		}
	}

	// Get current waypoint
	waypoint := p.Waypoints[p.currentWaypoint]

	// Get current position
	currentX, _, currentZ, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	// Check if we've reached the waypoint
	dx := waypoint.X - currentX
	dz := waypoint.Z - currentZ
	dist := math.Sqrt(dx*dx + dz*dz)

	if dist < 1.0 {
		// Start waiting
		p.isWaiting = true
		p.waitUntil = ctx.CurrentTime + p.WaitAtWaypoint
		return bt.StatusRunning
	}

	// Move to waypoint
	ctx.Blackboard.Set("move_target_x", waypoint.X)
	ctx.Blackboard.Set("move_target_z", waypoint.Z)

	return bt.StatusRunning
}

// Reset clears the patrol state.
func (p *PatrolAction) Reset() {
	p.currentWaypoint = 0
	p.isWaiting = false
}

// ========================================
// Combat Actions
// ========================================

// AttackTargetAction attacks the current target with the specified ability.
type AttackTargetAction struct {
	bt.BaseNode
	AbilityID    string
	Range        float64
	CooldownMs   int64
	lastAttack   int64
}

// NewAttackTargetAction creates a new attack action.
func NewAttackTargetAction(name, abilityID string, attackRange float64, cooldownMs int64) *AttackTargetAction {
	return &AttackTargetAction{
		BaseNode:   bt.BaseNode{Name: name},
		AbilityID:  abilityID,
		Range:      attackRange,
		CooldownMs: cooldownMs,
	}
}

// Execute attempts to attack the current target.
func (a *AttackTargetAction) Execute(ctx *bt.Context) bt.NodeStatus {
	// Check cooldown
	if ctx.CurrentTime-a.lastAttack < a.CooldownMs {
		return bt.StatusRunning
	}

	// Get target
	targetID, ok := ctx.Blackboard.GetString(bt.KeyCurrentTarget)
	if !ok || targetID == "" {
		return bt.StatusFailure
	}

	// Get positions
	currentX, currentY, currentZ, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	targetX, targetY, targetZ, ok := ctx.WorldQuery.GetEntityPosition(targetID)
	if !ok {
		ctx.Blackboard.Delete(bt.KeyCurrentTarget)
		return bt.StatusFailure
	}

	// Check range
	dx := targetX - currentX
	dy := targetY - currentY
	dz := targetZ - currentZ
	dist := math.Sqrt(dx*dx + dy*dy + dz*dz)

	if dist > a.Range {
		return bt.StatusFailure // Out of range
	}

	// Execute attack through combat interface
	if ctx.CombatInterface != nil {
		success := ctx.CombatInterface.ExecuteAbility(ctx.EntityID, targetID, a.AbilityID)
		if success {
			a.lastAttack = ctx.CurrentTime
			ctx.Blackboard.Set(bt.KeyLastAbilityUsed, a.AbilityID)
			ctx.Blackboard.Set(bt.KeyLastAbilityTime, ctx.CurrentTime)
			return bt.StatusSuccess
		}
	}

	return bt.StatusFailure
}

// Reset clears the attack state.
func (a *AttackTargetAction) Reset() {
	// Don't reset lastAttack - cooldown persists
}

// SelectTargetAction selects the highest threat target.
type SelectTargetAction struct {
	bt.BaseNode
}

// NewSelectTargetAction creates a new target selection action.
func NewSelectTargetAction(name string) *SelectTargetAction {
	return &SelectTargetAction{
		BaseNode: bt.BaseNode{Name: name},
	}
}

// Execute selects the highest threat target.
func (s *SelectTargetAction) Execute(ctx *bt.Context) bt.NodeStatus {
	if ctx.CombatInterface == nil {
		return bt.StatusFailure
	}

	// Get threat table
	threats := ctx.CombatInterface.GetThreatTable(ctx.EntityID)
	if len(threats) == 0 {
		return bt.StatusFailure
	}

	// Find highest threat
	var highestThreat bt.ThreatEntry
	for _, t := range threats {
		if t.ThreatValue > highestThreat.ThreatValue {
			highestThreat = t
		}
	}

	if highestThreat.EntityID != "" {
		ctx.Blackboard.Set(bt.KeyCurrentTarget, highestThreat.EntityID)
		ctx.Blackboard.Set(bt.KeyHighestThreat, highestThreat.EntityID)
		return bt.StatusSuccess
	}

	return bt.StatusFailure
}

// ClearTargetAction clears the current target.
type ClearTargetAction struct {
	bt.BaseNode
}

// NewClearTargetAction creates a new clear target action.
func NewClearTargetAction(name string) *ClearTargetAction {
	return &ClearTargetAction{
		BaseNode: bt.BaseNode{Name: name},
	}
}

// Execute clears the current target.
func (c *ClearTargetAction) Execute(ctx *bt.Context) bt.NodeStatus {
	ctx.Blackboard.Delete(bt.KeyCurrentTarget)
	ctx.Blackboard.Delete(bt.KeyHighestThreat)
	ctx.Blackboard.Set(bt.KeyIsInCombat, false)
	return bt.StatusSuccess
}

// FleeAction makes the NPC flee from its target.
type FleeAction struct {
	bt.BaseNode
	FleeDistance float64
}

// NewFleeAction creates a new flee action.
func NewFleeAction(name string, fleeDistance float64) *FleeAction {
	return &FleeAction{
		BaseNode:     bt.BaseNode{Name: name},
		FleeDistance: fleeDistance,
	}
}

// Execute moves the NPC away from its target.
func (f *FleeAction) Execute(ctx *bt.Context) bt.NodeStatus {
	targetID, ok := ctx.Blackboard.GetString(bt.KeyCurrentTarget)
	if !ok || targetID == "" {
		return bt.StatusFailure
	}

	// Get positions
	currentX, _, currentZ, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	targetX, _, targetZ, ok := ctx.WorldQuery.GetEntityPosition(targetID)
	if !ok {
		return bt.StatusSuccess // Target gone, stop fleeing
	}

	// Calculate flee direction (opposite of target)
	dx := currentX - targetX
	dz := currentZ - targetZ
	dist := math.Sqrt(dx*dx + dz*dz)

	if dist < 0.001 {
		// Very close, pick random direction
		dx = 1.0
		dz = 0.0
		dist = 1.0
	}

	// Normalize and extend to flee distance
	fleeX := currentX + (dx/dist)*f.FleeDistance
	fleeZ := currentZ + (dz/dist)*f.FleeDistance

	ctx.Blackboard.Set("move_target_x", fleeX)
	ctx.Blackboard.Set("move_target_z", fleeZ)
	ctx.Blackboard.Set(bt.KeyIsFleeing, true)

	return bt.StatusRunning
}

// Reset clears the flee state.
func (f *FleeAction) Reset() {
	// Flee flag is cleared when behavior changes
}

// CallForHelpAction alerts nearby allies about a threat.
type CallForHelpAction struct {
	bt.BaseNode
	CallRadius float64
}

// NewCallForHelpAction creates a new call for help action.
func NewCallForHelpAction(name string, callRadius float64) *CallForHelpAction {
	return &CallForHelpAction{
		BaseNode:   bt.BaseNode{Name: name},
		CallRadius: callRadius,
	}
}

// Execute alerts nearby allies.
func (c *CallForHelpAction) Execute(ctx *bt.Context) bt.NodeStatus {
	// Get current position
	x, y, z, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	// Get target
	targetID, ok := ctx.Blackboard.GetString(bt.KeyCurrentTarget)
	if !ok || targetID == "" {
		return bt.StatusFailure
	}

	// Find nearby entities
	nearbyIDs := ctx.WorldQuery.GetEntitiesInRadius(x, y, z, c.CallRadius)

	// Add threat to nearby allies (this would be handled by the AI system)
	// For now, we store the "call for help" event in blackboard
	ctx.Blackboard.Set("call_for_help_target", targetID)
	ctx.Blackboard.Set("call_for_help_allies", nearbyIDs)

	return bt.StatusSuccess
}
