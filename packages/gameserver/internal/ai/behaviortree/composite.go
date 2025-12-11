package behaviortree

// Selector tries each child in order until one succeeds.
// This is the "OR" node - if any child succeeds, the selector succeeds.
// Use case: Try different attack strategies until one works.
//
// Example:
//
//	Selector("TryAttack")
//	  ├── MeleeAttack (fails if not in range)
//	  ├── RangedAttack (fails if no line of sight)
//	  └── ChargeTowardsTarget (always succeeds, moves closer)
type Selector struct {
	BaseNode
	Children     []Node
	currentIndex int
}

// NewSelector creates a new Selector node with the given children.
func NewSelector(name string, children ...Node) *Selector {
	return &Selector{
		BaseNode: BaseNode{Name: name},
		Children: children,
	}
}

// Execute runs children in order until one succeeds or all fail.
func (s *Selector) Execute(ctx *Context) NodeStatus {
	for s.currentIndex < len(s.Children) {
		child := s.Children[s.currentIndex]
		status := child.Execute(ctx)

		switch status {
		case StatusSuccess:
			s.Reset()
			return StatusSuccess
		case StatusRunning:
			return StatusRunning
		case StatusFailure:
			// Try next child
			s.currentIndex++
		}
	}

	s.Reset()
	return StatusFailure
}

// Reset clears the selector's state and resets all children.
func (s *Selector) Reset() {
	s.currentIndex = 0
	for _, child := range s.Children {
		child.Reset()
	}
}

// Sequence executes all children in order, failing if any child fails.
// This is the "AND" node - all children must succeed for the sequence to succeed.
// Use case: Check conditions, then perform action.
//
// Example:
//
//	Sequence("AttackIfInRange")
//	  ├── TargetInRange (condition)
//	  ├── TargetIsHostile (condition)
//	  └── PerformAttack (action)
type Sequence struct {
	BaseNode
	Children     []Node
	currentIndex int
}

// NewSequence creates a new Sequence node with the given children.
func NewSequence(name string, children ...Node) *Sequence {
	return &Sequence{
		BaseNode: BaseNode{Name: name},
		Children: children,
	}
}

// Execute runs all children in order until one fails or all succeed.
func (s *Sequence) Execute(ctx *Context) NodeStatus {
	for s.currentIndex < len(s.Children) {
		child := s.Children[s.currentIndex]
		status := child.Execute(ctx)

		switch status {
		case StatusFailure:
			s.Reset()
			return StatusFailure
		case StatusRunning:
			return StatusRunning
		case StatusSuccess:
			// Continue to next child
			s.currentIndex++
		}
	}

	s.Reset()
	return StatusSuccess
}

// Reset clears the sequence's state and resets all children.
func (s *Sequence) Reset() {
	s.currentIndex = 0
	for _, child := range s.Children {
		child.Reset()
	}
}

// RandomSelector picks a random child to execute.
// Useful for varied NPC behavior (e.g., random idle animations).
type RandomSelector struct {
	BaseNode
	Children []Node
	randFunc func(n int) int // Injectable random function for testing
}

// NewRandomSelector creates a new RandomSelector node.
func NewRandomSelector(name string, randFunc func(n int) int, children ...Node) *RandomSelector {
	return &RandomSelector{
		BaseNode: BaseNode{Name: name},
		Children: children,
		randFunc: randFunc,
	}
}

// Execute picks a random child and executes it.
func (r *RandomSelector) Execute(ctx *Context) NodeStatus {
	if len(r.Children) == 0 {
		return StatusFailure
	}

	index := r.randFunc(len(r.Children))
	return r.Children[index].Execute(ctx)
}

// Reset resets all children.
func (r *RandomSelector) Reset() {
	for _, child := range r.Children {
		child.Reset()
	}
}

// ParallelSelector executes all children simultaneously.
// Succeeds if any child succeeds, fails only if all fail.
// Use case: Check multiple conditions at once.
type ParallelSelector struct {
	BaseNode
	Children []Node
}

// NewParallelSelector creates a new ParallelSelector node.
func NewParallelSelector(name string, children ...Node) *ParallelSelector {
	return &ParallelSelector{
		BaseNode: BaseNode{Name: name},
		Children: children,
	}
}

// Execute runs all children and returns based on collective results.
func (p *ParallelSelector) Execute(ctx *Context) NodeStatus {
	hasRunning := false

	for _, child := range p.Children {
		status := child.Execute(ctx)
		if status == StatusSuccess {
			return StatusSuccess
		}
		if status == StatusRunning {
			hasRunning = true
		}
	}

	if hasRunning {
		return StatusRunning
	}
	return StatusFailure
}

// Reset resets all children.
func (p *ParallelSelector) Reset() {
	for _, child := range p.Children {
		child.Reset()
	}
}

// ParallelSequence executes all children simultaneously.
// Succeeds only if all children succeed, fails if any fails.
type ParallelSequence struct {
	BaseNode
	Children []Node
}

// NewParallelSequence creates a new ParallelSequence node.
func NewParallelSequence(name string, children ...Node) *ParallelSequence {
	return &ParallelSequence{
		BaseNode: BaseNode{Name: name},
		Children: children,
	}
}

// Execute runs all children and returns based on collective results.
func (p *ParallelSequence) Execute(ctx *Context) NodeStatus {
	hasRunning := false
	hasFailure := false

	for _, child := range p.Children {
		status := child.Execute(ctx)
		switch status {
		case StatusFailure:
			hasFailure = true
		case StatusRunning:
			hasRunning = true
		}
	}

	if hasFailure {
		return StatusFailure
	}
	if hasRunning {
		return StatusRunning
	}
	return StatusSuccess
}

// Reset resets all children.
func (p *ParallelSequence) Reset() {
	for _, child := range p.Children {
		child.Reset()
	}
}
