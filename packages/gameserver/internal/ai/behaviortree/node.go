// Package behaviortree implements a modular behavior tree system for NPC AI.
// Behavior trees allow for complex, hierarchical decision-making while
// remaining maintainable and debuggable.
package behaviortree

// NodeStatus represents the result of executing a behavior tree node.
type NodeStatus int

const (
	// StatusSuccess indicates the node completed successfully
	StatusSuccess NodeStatus = iota
	// StatusFailure indicates the node failed to complete
	StatusFailure
	// StatusRunning indicates the node is still executing
	StatusRunning
)

// String returns a human-readable status name
func (s NodeStatus) String() string {
	switch s {
	case StatusSuccess:
		return "SUCCESS"
	case StatusFailure:
		return "FAILURE"
	case StatusRunning:
		return "RUNNING"
	default:
		return "UNKNOWN"
	}
}

// Node is the interface that all behavior tree nodes must implement.
// Each node can be a leaf (action/condition) or a composite (selector/sequence).
type Node interface {
	// Execute runs the node logic and returns its status
	Execute(ctx *Context) NodeStatus

	// Reset clears any running state (called when tree restarts)
	Reset()

	// GetName returns the node's name for debugging
	GetName() string
}

// Context provides access to the NPC state and game world during node execution.
// It is passed through all nodes in the tree during a single tick.
type Context struct {
	// EntityID is the ID of the NPC running this behavior tree
	EntityID string

	// Blackboard provides shared memory between nodes
	Blackboard *Blackboard

	// DeltaTime is the time elapsed since last tick (seconds)
	DeltaTime float64

	// CurrentTime is the current server time (milliseconds)
	CurrentTime int64

	// WorldQuery provides access to query world state
	WorldQuery WorldQueryInterface

	// CombatInterface provides access to combat system
	CombatInterface CombatInterface
}

// WorldQueryInterface defines methods for querying the game world.
// This abstraction allows the AI system to be tested independently.
type WorldQueryInterface interface {
	// GetEntityPosition returns the position of an entity
	GetEntityPosition(entityID string) (x, y, z float64, ok bool)

	// GetEntitiesInRadius returns entity IDs within a radius of a point
	GetEntitiesInRadius(x, y, z, radius float64) []string

	// GetEntityByID returns entity data by ID
	GetEntityByID(entityID string) interface{}

	// IsLineOfSight checks if there's clear line of sight between two points
	IsLineOfSight(x1, y1, z1, x2, y2, z2 float64) bool
}

// CombatInterface defines methods for combat interactions.
type CombatInterface interface {
	// ExecuteAbility attempts to use an ability against a target
	ExecuteAbility(casterID, targetID, abilityID string) bool

	// GetThreatTable returns the threat entries for an NPC
	GetThreatTable(entityID string) []ThreatEntry

	// AddThreat adds threat from a source to an NPC
	AddThreat(npcID, sourceID string, amount float64)
}

// ThreatEntry represents a single entry in an NPC's threat table.
type ThreatEntry struct {
	EntityID    string
	ThreatValue float64
}

// BaseNode provides common functionality for all node types.
type BaseNode struct {
	Name string
}

// GetName returns the node's name for debugging purposes.
func (n *BaseNode) GetName() string {
	return n.Name
}

// Reset is a default no-op reset implementation.
func (n *BaseNode) Reset() {
	// Override in subclasses if needed
}
