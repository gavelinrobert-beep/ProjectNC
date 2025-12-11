// Package conditions provides behavior tree condition nodes for NPC decision making.
// Conditions are leaf nodes that evaluate game state and return success/failure.
package conditions

import (
	"math"

	bt "github.com/mmorpg/gameserver/internal/ai/behaviortree"
)

// ========================================
// Target Conditions
// ========================================

// TargetInRangeCondition checks if the current target is within a specified range.
type TargetInRangeCondition struct {
	bt.BaseNode
	Range float64
}

// NewTargetInRangeCondition creates a new target in range condition.
func NewTargetInRangeCondition(name string, rangeValue float64) *TargetInRangeCondition {
	return &TargetInRangeCondition{
		BaseNode: bt.BaseNode{Name: name},
		Range:    rangeValue,
	}
}

// Execute checks if the target is within range.
func (t *TargetInRangeCondition) Execute(ctx *bt.Context) bt.NodeStatus {
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
		return bt.StatusFailure
	}

	// Calculate distance
	dx := targetX - currentX
	dy := targetY - currentY
	dz := targetZ - currentZ
	dist := math.Sqrt(dx*dx + dy*dy + dz*dz)

	if dist <= t.Range {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// HasAggroTargetCondition checks if the NPC has a valid aggro target.
type HasAggroTargetCondition struct {
	bt.BaseNode
}

// NewHasAggroTargetCondition creates a new has aggro target condition.
func NewHasAggroTargetCondition(name string) *HasAggroTargetCondition {
	return &HasAggroTargetCondition{
		BaseNode: bt.BaseNode{Name: name},
	}
}

// Execute checks if there is a valid aggro target.
func (h *HasAggroTargetCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	targetID, ok := ctx.Blackboard.GetString(bt.KeyCurrentTarget)
	if !ok || targetID == "" {
		return bt.StatusFailure
	}

	// Verify target still exists
	_, _, _, ok = ctx.WorldQuery.GetEntityPosition(targetID)
	if !ok {
		// Target no longer exists, clear it
		ctx.Blackboard.Delete(bt.KeyCurrentTarget)
		return bt.StatusFailure
	}

	return bt.StatusSuccess
}

// PlayerDetectedCondition checks if any hostile player is detected nearby.
type PlayerDetectedCondition struct {
	bt.BaseNode
	DetectionRadius float64
}

// NewPlayerDetectedCondition creates a new player detected condition.
func NewPlayerDetectedCondition(name string, detectionRadius float64) *PlayerDetectedCondition {
	return &PlayerDetectedCondition{
		BaseNode:        bt.BaseNode{Name: name},
		DetectionRadius: detectionRadius,
	}
}

// Execute checks if any player is within detection radius.
func (p *PlayerDetectedCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	// Get current position
	x, y, z, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	// Get nearby entities
	nearbyIDs := ctx.WorldQuery.GetEntitiesInRadius(x, y, z, p.DetectionRadius)

	// Check if any are players (this would need entity type info)
	// For now, check if there are any entities in radius
	if len(nearbyIDs) > 0 {
		// Store detected entities for further processing
		ctx.Blackboard.Set("detected_entities", nearbyIDs)
		return bt.StatusSuccess
	}

	return bt.StatusFailure
}

// TargetExistsCondition checks if a target is set in the blackboard.
type TargetExistsCondition struct {
	bt.BaseNode
}

// NewTargetExistsCondition creates a new target exists condition.
func NewTargetExistsCondition(name string) *TargetExistsCondition {
	return &TargetExistsCondition{
		BaseNode: bt.BaseNode{Name: name},
	}
}

// Execute checks if a target exists.
func (t *TargetExistsCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	if ctx.Blackboard.Has(bt.KeyCurrentTarget) {
		targetID, _ := ctx.Blackboard.GetString(bt.KeyCurrentTarget)
		if targetID != "" {
			return bt.StatusSuccess
		}
	}
	return bt.StatusFailure
}

// TargetIsAliveCondition checks if the current target is alive.
type TargetIsAliveCondition struct {
	bt.BaseNode
}

// NewTargetIsAliveCondition creates a new target is alive condition.
func NewTargetIsAliveCondition(name string) *TargetIsAliveCondition {
	return &TargetIsAliveCondition{
		BaseNode: bt.BaseNode{Name: name},
	}
}

// Execute checks if the target is alive.
func (t *TargetIsAliveCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	targetID, ok := ctx.Blackboard.GetString(bt.KeyCurrentTarget)
	if !ok || targetID == "" {
		return bt.StatusFailure
	}

	// Check if target still exists (existence implies alive for now)
	// Future: Add health check through world query
	_, _, _, ok = ctx.WorldQuery.GetEntityPosition(targetID)
	if !ok {
		return bt.StatusFailure
	}

	return bt.StatusSuccess
}

// ========================================
// Health Conditions
// ========================================

// LowHealthCondition checks if the NPC's health is below a threshold.
type LowHealthCondition struct {
	bt.BaseNode
	Threshold float64 // Percentage (0.0 to 1.0)
}

// NewLowHealthCondition creates a new low health condition.
func NewLowHealthCondition(name string, threshold float64) *LowHealthCondition {
	return &LowHealthCondition{
		BaseNode:  bt.BaseNode{Name: name},
		Threshold: threshold,
	}
}

// Execute checks if health is below threshold.
func (l *LowHealthCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	healthPercent, ok := ctx.Blackboard.GetFloat(bt.KeyHealthPercent)
	if !ok {
		return bt.StatusFailure
	}

	if healthPercent <= l.Threshold {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// HealthAboveCondition checks if the NPC's health is above a threshold.
type HealthAboveCondition struct {
	bt.BaseNode
	Threshold float64
}

// NewHealthAboveCondition creates a new health above condition.
func NewHealthAboveCondition(name string, threshold float64) *HealthAboveCondition {
	return &HealthAboveCondition{
		BaseNode:  bt.BaseNode{Name: name},
		Threshold: threshold,
	}
}

// Execute checks if health is above threshold.
func (h *HealthAboveCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	healthPercent, ok := ctx.Blackboard.GetFloat(bt.KeyHealthPercent)
	if !ok {
		// Assume full health if not set
		return bt.StatusSuccess
	}

	if healthPercent > h.Threshold {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// ========================================
// State Conditions
// ========================================

// IsInCombatCondition checks if the NPC is currently in combat.
type IsInCombatCondition struct {
	bt.BaseNode
}

// NewIsInCombatCondition creates a new is in combat condition.
func NewIsInCombatCondition(name string) *IsInCombatCondition {
	return &IsInCombatCondition{
		BaseNode: bt.BaseNode{Name: name},
	}
}

// Execute checks if in combat.
func (i *IsInCombatCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	inCombat, ok := ctx.Blackboard.GetBool(bt.KeyIsInCombat)
	if ok && inCombat {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// IsEvadingCondition checks if the NPC is returning to spawn.
type IsEvadingCondition struct {
	bt.BaseNode
}

// NewIsEvadingCondition creates a new is evading condition.
func NewIsEvadingCondition(name string) *IsEvadingCondition {
	return &IsEvadingCondition{
		BaseNode: bt.BaseNode{Name: name},
	}
}

// Execute checks if evading.
func (i *IsEvadingCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	evading, ok := ctx.Blackboard.GetBool(bt.KeyIsEvading)
	if ok && evading {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// ========================================
// Distance Conditions
// ========================================

// TooFarFromHomeCondition checks if the NPC is too far from its home position.
type TooFarFromHomeCondition struct {
	bt.BaseNode
	MaxDistance float64
}

// NewTooFarFromHomeCondition creates a new too far from home condition.
func NewTooFarFromHomeCondition(name string, maxDistance float64) *TooFarFromHomeCondition {
	return &TooFarFromHomeCondition{
		BaseNode:    bt.BaseNode{Name: name},
		MaxDistance: maxDistance,
	}
}

// Execute checks if too far from home.
func (t *TooFarFromHomeCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	homePos, ok := ctx.Blackboard.Get(bt.KeyHomePosition).(bt.Position3D)
	if !ok {
		return bt.StatusFailure
	}

	x, _, z, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	dx := x - homePos.X
	dz := z - homePos.Z
	dist := math.Sqrt(dx*dx + dz*dz)

	if dist > t.MaxDistance {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// AtHomeCondition checks if the NPC is at its home position.
type AtHomeCondition struct {
	bt.BaseNode
	Threshold float64
}

// NewAtHomeCondition creates a new at home condition.
func NewAtHomeCondition(name string, threshold float64) *AtHomeCondition {
	return &AtHomeCondition{
		BaseNode:  bt.BaseNode{Name: name},
		Threshold: threshold,
	}
}

// Execute checks if at home.
func (a *AtHomeCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	homePos, ok := ctx.Blackboard.Get(bt.KeyHomePosition).(bt.Position3D)
	if !ok {
		return bt.StatusFailure
	}

	x, _, z, ok := ctx.WorldQuery.GetEntityPosition(ctx.EntityID)
	if !ok {
		return bt.StatusFailure
	}

	dx := x - homePos.X
	dz := z - homePos.Z
	dist := math.Sqrt(dx*dx + dz*dz)

	if dist <= a.Threshold {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// ========================================
// Cooldown Conditions
// ========================================

// AbilityReadyCondition checks if an ability is off cooldown.
type AbilityReadyCondition struct {
	bt.BaseNode
	AbilityID  string
	CooldownMs int64
}

// NewAbilityReadyCondition creates a new ability ready condition.
func NewAbilityReadyCondition(name, abilityID string, cooldownMs int64) *AbilityReadyCondition {
	return &AbilityReadyCondition{
		BaseNode:   bt.BaseNode{Name: name},
		AbilityID:  abilityID,
		CooldownMs: cooldownMs,
	}
}

// Execute checks if the ability is ready.
func (a *AbilityReadyCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	lastAbility, ok := ctx.Blackboard.GetString(bt.KeyLastAbilityUsed)
	if !ok || lastAbility != a.AbilityID {
		return bt.StatusSuccess // Never used or different ability
	}

	lastTime, ok := ctx.Blackboard.Get(bt.KeyLastAbilityTime).(int64)
	if !ok {
		return bt.StatusSuccess
	}

	if ctx.CurrentTime-lastTime >= a.CooldownMs {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// ========================================
// Threat Conditions
// ========================================

// HasThreatCondition checks if the NPC has any entries in its threat table.
type HasThreatCondition struct {
	bt.BaseNode
}

// NewHasThreatCondition creates a new has threat condition.
func NewHasThreatCondition(name string) *HasThreatCondition {
	return &HasThreatCondition{
		BaseNode: bt.BaseNode{Name: name},
	}
}

// Execute checks if there are threats.
func (h *HasThreatCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	if ctx.CombatInterface == nil {
		return bt.StatusFailure
	}

	threats := ctx.CombatInterface.GetThreatTable(ctx.EntityID)
	if len(threats) > 0 {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// ThreatAboveCondition checks if total threat exceeds a threshold.
type ThreatAboveCondition struct {
	bt.BaseNode
	Threshold float64
}

// NewThreatAboveCondition creates a new threat above condition.
func NewThreatAboveCondition(name string, threshold float64) *ThreatAboveCondition {
	return &ThreatAboveCondition{
		BaseNode:  bt.BaseNode{Name: name},
		Threshold: threshold,
	}
}

// Execute checks if threat exceeds threshold.
func (t *ThreatAboveCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	if ctx.CombatInterface == nil {
		return bt.StatusFailure
	}

	threats := ctx.CombatInterface.GetThreatTable(ctx.EntityID)
	totalThreat := 0.0
	for _, entry := range threats {
		totalThreat += entry.ThreatValue
	}

	if totalThreat > t.Threshold {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// ========================================
// Generic Conditions
// ========================================

// RandomChanceCondition succeeds based on a random chance.
type RandomChanceCondition struct {
	bt.BaseNode
	Chance   float64       // 0.0 to 1.0
	RandFunc func() float64
}

// NewRandomChanceCondition creates a new random chance condition.
func NewRandomChanceCondition(name string, chance float64, randFunc func() float64) *RandomChanceCondition {
	return &RandomChanceCondition{
		BaseNode: bt.BaseNode{Name: name},
		Chance:   chance,
		RandFunc: randFunc,
	}
}

// Execute succeeds based on random chance.
func (r *RandomChanceCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	if r.RandFunc() < r.Chance {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}

// TimeSinceCondition checks if enough time has passed since a timestamp.
type TimeSinceCondition struct {
	bt.BaseNode
	BlackboardKey string
	MinTimeMs     int64
}

// NewTimeSinceCondition creates a new time since condition.
func NewTimeSinceCondition(name, blackboardKey string, minTimeMs int64) *TimeSinceCondition {
	return &TimeSinceCondition{
		BaseNode:      bt.BaseNode{Name: name},
		BlackboardKey: blackboardKey,
		MinTimeMs:     minTimeMs,
	}
}

// Execute checks if enough time has passed.
func (t *TimeSinceCondition) Execute(ctx *bt.Context) bt.NodeStatus {
	timestamp, ok := ctx.Blackboard.Get(t.BlackboardKey).(int64)
	if !ok {
		return bt.StatusSuccess // No timestamp = condition met
	}

	if ctx.CurrentTime-timestamp >= t.MinTimeMs {
		return bt.StatusSuccess
	}
	return bt.StatusFailure
}
