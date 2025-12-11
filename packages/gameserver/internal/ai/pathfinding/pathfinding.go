// Package pathfinding provides pathfinding algorithms for NPC navigation.
// This package includes an A* implementation and pathfinding interface.
package pathfinding

import (
	"container/heap"
	"math"
)

// Position represents a 3D position in the game world.
type Position struct {
	X, Y, Z float64
}

// Node represents a node in the navigation grid.
type Node struct {
	X, Y, Z   float64
	Walkable  bool
	Neighbors []*Node
}

// Path represents a calculated path from start to goal.
type Path struct {
	Waypoints []Position
	TotalCost float64
	IsValid   bool
}

// PathfindingConfig holds configuration for the pathfinding system.
type PathfindingConfig struct {
	// MaxSearchNodes limits the number of nodes searched (performance safety)
	MaxSearchNodes int

	// GridResolution is the distance between navigation grid nodes
	GridResolution float64

	// MaxSlope is the maximum walkable slope angle (degrees)
	MaxSlope float64

	// AgentRadius is used for collision avoidance
	AgentRadius float64

	// AgentHeight is used for clearance checking
	AgentHeight float64
}

// DefaultPathfindingConfig returns standard pathfinding configuration.
func DefaultPathfindingConfig() PathfindingConfig {
	return PathfindingConfig{
		MaxSearchNodes: 1000,
		GridResolution: 1.0,
		MaxSlope:       45.0,
		AgentRadius:    0.5,
		AgentHeight:    2.0,
	}
}

// Pathfinder is the interface for pathfinding implementations.
// This allows swapping between A*, NavMesh, or other algorithms.
type Pathfinder interface {
	// FindPath calculates a path from start to goal
	FindPath(start, goal Position) Path

	// IsWalkable checks if a position is walkable
	IsWalkable(pos Position) bool

	// GetNearestWalkable returns the nearest walkable position
	GetNearestWalkable(pos Position) Position
}

// ========================================
// A* Pathfinding Implementation
// ========================================

// AStarPathfinder implements the A* pathfinding algorithm.
// A* is optimal for grid-based or graph-based navigation.
type AStarPathfinder struct {
	Config     PathfindingConfig
	grid       map[gridKey]*Node
	worldQuery WorldQuery
}

// gridKey is used for spatial hashing of grid nodes.
type gridKey struct {
	X, Y, Z int
}

// WorldQuery provides world data needed for pathfinding.
type WorldQuery interface {
	// GetTerrainHeight returns the terrain height at a position
	GetTerrainHeight(x, z float64) float64

	// IsObstacle checks if a position is blocked by an obstacle
	IsObstacle(x, y, z, radius, height float64) bool

	// GetNavigationNodes returns pre-computed navigation nodes for an area
	GetNavigationNodes(minX, minY, minZ, maxX, maxY, maxZ float64) []*Node
}

// NewAStarPathfinder creates a new A* pathfinder.
func NewAStarPathfinder(config PathfindingConfig, worldQuery WorldQuery) *AStarPathfinder {
	return &AStarPathfinder{
		Config:     config,
		grid:       make(map[gridKey]*Node),
		worldQuery: worldQuery,
	}
}

// FindPath calculates an optimal path from start to goal using A*.
func (a *AStarPathfinder) FindPath(start, goal Position) Path {
	// Validate start and goal
	if !a.IsWalkable(start) {
		start = a.GetNearestWalkable(start)
	}
	if !a.IsWalkable(goal) {
		goal = a.GetNearestWalkable(goal)
	}

	// Check if start and goal are the same
	if a.positionsEqual(start, goal) {
		return Path{
			Waypoints: []Position{goal},
			TotalCost: 0,
			IsValid:   true,
		}
	}

	// Initialize open and closed sets
	openSet := &astarPriorityQueue{}
	heap.Init(openSet)
	closedSet := make(map[gridKey]bool)

	// Create start node
	startNode := &astarNode{
		Pos:    start,
		GScore: 0,
		HScore: a.heuristic(start, goal),
	}
	startNode.FScore = startNode.GScore + startNode.HScore

	heap.Push(openSet, startNode)
	nodesSearched := 0

	for openSet.Len() > 0 && nodesSearched < a.Config.MaxSearchNodes {
		nodesSearched++

		// Get node with lowest F score
		current := heap.Pop(openSet).(*astarNode)

		// Check if we've reached the goal
		if a.positionsEqual(current.Pos, goal) {
			return a.reconstructPath(current)
		}

		// Add to closed set
		key := a.posToKey(current.Pos)
		closedSet[key] = true

		// Explore neighbors
		neighbors := a.getNeighbors(current.Pos)
		for _, neighborPos := range neighbors {
			neighborKey := a.posToKey(neighborPos)

			// Skip if already evaluated
			if closedSet[neighborKey] {
				continue
			}

			// Calculate tentative G score
			moveCost := a.movementCost(current.Pos, neighborPos)
			tentativeG := current.GScore + moveCost

			// Check if this path is better
			var neighbor *astarNode
			for _, n := range *openSet {
				if a.posToKey(n.Pos) == neighborKey {
					neighbor = n
					break
				}
			}

			if neighbor == nil {
				// New node
				neighbor = &astarNode{
					Pos:    neighborPos,
					GScore: tentativeG,
					HScore: a.heuristic(neighborPos, goal),
					Parent: current,
				}
				neighbor.FScore = neighbor.GScore + neighbor.HScore
				heap.Push(openSet, neighbor)
			} else if tentativeG < neighbor.GScore {
				// Better path found
				neighbor.GScore = tentativeG
				neighbor.FScore = neighbor.GScore + neighbor.HScore
				neighbor.Parent = current
				heap.Fix(openSet, neighbor.index)
			}
		}
	}

	// No path found
	return Path{IsValid: false}
}

// astarNode represents a node in the A* search.
type astarNode struct {
	Pos    Position
	GScore float64 // Cost from start to this node
	HScore float64 // Heuristic cost from this node to goal
	FScore float64 // GScore + HScore
	Parent *astarNode
	index  int // Priority queue index
}

// astarPriorityQueue implements heap.Interface for A* nodes.
type astarPriorityQueue []*astarNode

func (pq astarPriorityQueue) Len() int { return len(pq) }

func (pq astarPriorityQueue) Less(i, j int) bool {
	return pq[i].FScore < pq[j].FScore
}

func (pq astarPriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *astarPriorityQueue) Push(x interface{}) {
	n := len(*pq)
	node := x.(*astarNode)
	node.index = n
	*pq = append(*pq, node)
}

func (pq *astarPriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	node := old[n-1]
	old[n-1] = nil
	node.index = -1
	*pq = old[0 : n-1]
	return node
}

// heuristic estimates the cost from a position to the goal.
// Uses Euclidean distance for smooth paths.
func (a *AStarPathfinder) heuristic(from, to Position) float64 {
	dx := to.X - from.X
	dy := to.Y - from.Y
	dz := to.Z - from.Z
	return math.Sqrt(dx*dx + dy*dy + dz*dz)
}

// movementCost calculates the cost to move between adjacent positions.
func (a *AStarPathfinder) movementCost(from, to Position) float64 {
	dx := to.X - from.X
	dy := to.Y - from.Y
	dz := to.Z - from.Z
	distance := math.Sqrt(dx*dx + dy*dy + dz*dz)

	// Penalize uphill movement slightly
	if dy > 0 {
		distance *= 1.2
	}

	return distance
}

// getNeighbors returns walkable positions adjacent to the given position.
func (a *AStarPathfinder) getNeighbors(pos Position) []Position {
	neighbors := []Position{}
	res := a.Config.GridResolution

	// 8 directions + up/down for 3D navigation
	offsets := []Position{
		{res, 0, 0}, {-res, 0, 0},
		{0, 0, res}, {0, 0, -res},
		{res, 0, res}, {res, 0, -res},
		{-res, 0, res}, {-res, 0, -res},
	}

	for _, offset := range offsets {
		neighbor := Position{
			X: pos.X + offset.X,
			Y: pos.Y + offset.Y,
			Z: pos.Z + offset.Z,
		}

		// Adjust Y to terrain height
		if a.worldQuery != nil {
			neighbor.Y = a.worldQuery.GetTerrainHeight(neighbor.X, neighbor.Z)

			// Check slope
			dy := neighbor.Y - pos.Y
			dx := math.Sqrt(offset.X*offset.X + offset.Z*offset.Z)
			slopeAngle := math.Atan2(dy, dx) * (180.0 / math.Pi)
			if math.Abs(slopeAngle) > a.Config.MaxSlope {
				continue
			}
		}

		if a.IsWalkable(neighbor) {
			neighbors = append(neighbors, neighbor)
		}
	}

	return neighbors
}

// IsWalkable checks if a position is walkable.
func (a *AStarPathfinder) IsWalkable(pos Position) bool {
	if a.worldQuery == nil {
		return true // No world query = assume walkable
	}
	return !a.worldQuery.IsObstacle(pos.X, pos.Y, pos.Z, a.Config.AgentRadius, a.Config.AgentHeight)
}

// GetNearestWalkable returns the nearest walkable position.
func (a *AStarPathfinder) GetNearestWalkable(pos Position) Position {
	if a.IsWalkable(pos) {
		return pos
	}

	// Spiral outward to find walkable position
	res := a.Config.GridResolution
	for radius := res; radius <= res*10; radius += res {
		for dx := -radius; dx <= radius; dx += res {
			for dz := -radius; dz <= radius; dz += res {
				candidate := Position{
					X: pos.X + dx,
					Y: pos.Y,
					Z: pos.Z + dz,
				}
				if a.worldQuery != nil {
					candidate.Y = a.worldQuery.GetTerrainHeight(candidate.X, candidate.Z)
				}
				if a.IsWalkable(candidate) {
					return candidate
				}
			}
		}
	}

	return pos // No walkable position found, return original
}

// reconstructPath builds the path from start to goal by following parent pointers.
func (a *AStarPathfinder) reconstructPath(node *astarNode) Path {
	waypoints := []Position{}
	current := node

	for current != nil {
		waypoints = append([]Position{current.Pos}, waypoints...)
		current = current.Parent
	}

	// Optimize path by removing unnecessary waypoints
	optimized := a.smoothPath(waypoints)

	return Path{
		Waypoints: optimized,
		TotalCost: node.GScore,
		IsValid:   true,
	}
}

// smoothPath removes unnecessary waypoints while maintaining path validity.
func (a *AStarPathfinder) smoothPath(path []Position) []Position {
	if len(path) <= 2 {
		return path
	}

	smoothed := []Position{path[0]}
	current := 0

	for current < len(path)-1 {
		// Try to skip as many waypoints as possible
		farthest := current + 1
		for next := current + 2; next < len(path); next++ {
			if a.canMoveStraight(path[current], path[next]) {
				farthest = next
			}
		}
		smoothed = append(smoothed, path[farthest])
		current = farthest
	}

	return smoothed
}

// canMoveStraight checks if we can move in a straight line between two points.
func (a *AStarPathfinder) canMoveStraight(from, to Position) bool {
	// Simple line-of-sight check by sampling points along the line
	dx := to.X - from.X
	dz := to.Z - from.Z
	distance := math.Sqrt(dx*dx + dz*dz)
	steps := int(distance / a.Config.GridResolution)

	for i := 1; i < steps; i++ {
		t := float64(i) / float64(steps)
		pos := Position{
			X: from.X + dx*t,
			Y: 0,
			Z: from.Z + dz*t,
		}
		if a.worldQuery != nil {
			pos.Y = a.worldQuery.GetTerrainHeight(pos.X, pos.Z)
		}
		if !a.IsWalkable(pos) {
			return false
		}
	}

	return true
}

// positionsEqual checks if two positions are approximately equal.
func (a *AStarPathfinder) positionsEqual(p1, p2 Position) bool {
	const epsilon = 0.1
	return math.Abs(p1.X-p2.X) < epsilon &&
		math.Abs(p1.Y-p2.Y) < epsilon &&
		math.Abs(p1.Z-p2.Z) < epsilon
}

// posToKey converts a position to a grid key for hashing.
func (a *AStarPathfinder) posToKey(pos Position) gridKey {
	res := a.Config.GridResolution
	return gridKey{
		X: int(math.Round(pos.X / res)),
		Y: int(math.Round(pos.Y / res)),
		Z: int(math.Round(pos.Z / res)),
	}
}

// ========================================
// Simple Pathfinder (for testing/fallback)
// ========================================

// SimplePathfinder provides direct line pathfinding without obstacle avoidance.
// Use this for testing or when full pathfinding isn't needed.
type SimplePathfinder struct{}

// NewSimplePathfinder creates a new simple pathfinder.
func NewSimplePathfinder() *SimplePathfinder {
	return &SimplePathfinder{}
}

// FindPath returns a direct path from start to goal.
func (s *SimplePathfinder) FindPath(start, goal Position) Path {
	return Path{
		Waypoints: []Position{start, goal},
		TotalCost: s.distance(start, goal),
		IsValid:   true,
	}
}

// IsWalkable always returns true (no obstacle checking).
func (s *SimplePathfinder) IsWalkable(pos Position) bool {
	return true
}

// GetNearestWalkable returns the position unchanged.
func (s *SimplePathfinder) GetNearestWalkable(pos Position) Position {
	return pos
}

func (s *SimplePathfinder) distance(p1, p2 Position) float64 {
	dx := p2.X - p1.X
	dy := p2.Y - p1.Y
	dz := p2.Z - p1.Z
	return math.Sqrt(dx*dx + dy*dy + dz*dz)
}
