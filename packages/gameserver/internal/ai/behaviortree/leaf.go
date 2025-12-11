package behaviortree

// ConditionNode is a leaf node that evaluates a condition.
// Conditions are instant (never return StatusRunning).
// They are typically used at the start of a Sequence to gate actions.

// ConditionFunc is a function that evaluates a condition.
type ConditionFunc func(ctx *Context) bool

// ConditionNode wraps a condition function as a behavior tree node.
type ConditionNode struct {
	BaseNode
	Condition ConditionFunc
}

// NewConditionNode creates a new condition node.
func NewConditionNode(name string, condition ConditionFunc) *ConditionNode {
	return &ConditionNode{
		BaseNode:  BaseNode{Name: name},
		Condition: condition,
	}
}

// Execute evaluates the condition and returns Success or Failure.
func (c *ConditionNode) Execute(ctx *Context) NodeStatus {
	if c.Condition(ctx) {
		return StatusSuccess
	}
	return StatusFailure
}

// ActionNode is a leaf node that performs an action.
// Actions can be instant or take multiple ticks (return StatusRunning).

// ActionFunc is a function that performs an action.
// It should return true when complete, false when still running.
type ActionFunc func(ctx *Context) NodeStatus

// ActionNode wraps an action function as a behavior tree node.
type ActionNode struct {
	BaseNode
	Action    ActionFunc
	OnReset   func() // Optional cleanup function
	isRunning bool
}

// NewActionNode creates a new action node.
func NewActionNode(name string, action ActionFunc) *ActionNode {
	return &ActionNode{
		BaseNode: BaseNode{Name: name},
		Action:   action,
	}
}

// Execute performs the action.
func (a *ActionNode) Execute(ctx *Context) NodeStatus {
	status := a.Action(ctx)
	a.isRunning = status == StatusRunning
	return status
}

// Reset calls the optional reset function.
func (a *ActionNode) Reset() {
	a.isRunning = false
	if a.OnReset != nil {
		a.OnReset()
	}
}

// WaitNode is an action that waits for a specified duration.
// Use case: Pause between patrol waypoints, delay before attacking.
type WaitNode struct {
	BaseNode
	DurationMs int64 // Duration to wait in milliseconds
	startTime  int64
	isWaiting  bool
}

// NewWaitNode creates a new wait node.
func NewWaitNode(name string, durationMs int64) *WaitNode {
	return &WaitNode{
		BaseNode:   BaseNode{Name: name},
		DurationMs: durationMs,
	}
}

// Execute waits for the specified duration.
func (w *WaitNode) Execute(ctx *Context) NodeStatus {
	if !w.isWaiting {
		w.startTime = ctx.CurrentTime
		w.isWaiting = true
	}

	if ctx.CurrentTime-w.startTime >= w.DurationMs {
		w.Reset()
		return StatusSuccess
	}

	return StatusRunning
}

// Reset clears the wait state.
func (w *WaitNode) Reset() {
	w.isWaiting = false
	w.startTime = 0
}

// LogNode logs a message and always succeeds.
// Use case: Debugging behavior tree execution.
type LogNode struct {
	BaseNode
	Message  string
	LogFunc  func(entityID, message string) // Custom log function
}

// NewLogNode creates a new log node.
func NewLogNode(name string, message string, logFunc func(entityID, message string)) *LogNode {
	return &LogNode{
		BaseNode: BaseNode{Name: name},
		Message:  message,
		LogFunc:  logFunc,
	}
}

// Execute logs the message and returns Success.
func (l *LogNode) Execute(ctx *Context) NodeStatus {
	if l.LogFunc != nil {
		l.LogFunc(ctx.EntityID, l.Message)
	}
	return StatusSuccess
}

// SetBlackboardNode sets a value in the blackboard.
type SetBlackboardNode struct {
	BaseNode
	Key      string
	ValueFn  func(ctx *Context) interface{}
}

// NewSetBlackboardNode creates a node that sets a blackboard value.
func NewSetBlackboardNode(name, key string, valueFn func(ctx *Context) interface{}) *SetBlackboardNode {
	return &SetBlackboardNode{
		BaseNode: BaseNode{Name: name},
		Key:      key,
		ValueFn:  valueFn,
	}
}

// Execute sets the blackboard value and returns Success.
func (s *SetBlackboardNode) Execute(ctx *Context) NodeStatus {
	value := s.ValueFn(ctx)
	ctx.Blackboard.Set(s.Key, value)
	return StatusSuccess
}

// ClearBlackboardNode removes a key from the blackboard.
type ClearBlackboardNode struct {
	BaseNode
	Key string
}

// NewClearBlackboardNode creates a node that clears a blackboard key.
func NewClearBlackboardNode(name, key string) *ClearBlackboardNode {
	return &ClearBlackboardNode{
		BaseNode: BaseNode{Name: name},
		Key:      key,
	}
}

// Execute removes the key and returns Success.
func (c *ClearBlackboardNode) Execute(ctx *Context) NodeStatus {
	ctx.Blackboard.Delete(c.Key)
	return StatusSuccess
}

// HasBlackboardKeyNode checks if a key exists in the blackboard.
type HasBlackboardKeyNode struct {
	BaseNode
	Key string
}

// NewHasBlackboardKeyNode creates a node that checks for a blackboard key.
func NewHasBlackboardKeyNode(name, key string) *HasBlackboardKeyNode {
	return &HasBlackboardKeyNode{
		BaseNode: BaseNode{Name: name},
		Key:      key,
	}
}

// Execute returns Success if the key exists, Failure otherwise.
func (h *HasBlackboardKeyNode) Execute(ctx *Context) NodeStatus {
	if ctx.Blackboard.Has(h.Key) {
		return StatusSuccess
	}
	return StatusFailure
}
