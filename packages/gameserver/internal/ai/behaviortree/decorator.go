package behaviortree

// DecoratorNode wraps a single child and modifies its behavior.
// Decorators are used for inverting results, repeating, timing, etc.

// Inverter inverts the result of its child (success <-> failure).
// Use case: Convert "IsAlive" to "IsDead".
type Inverter struct {
	BaseNode
	Child Node
}

// NewInverter creates a new Inverter decorator.
func NewInverter(name string, child Node) *Inverter {
	return &Inverter{
		BaseNode: BaseNode{Name: name},
		Child:    child,
	}
}

// Execute inverts the child's result.
func (i *Inverter) Execute(ctx *Context) NodeStatus {
	status := i.Child.Execute(ctx)
	switch status {
	case StatusSuccess:
		return StatusFailure
	case StatusFailure:
		return StatusSuccess
	default:
		return status
	}
}

// Reset resets the child node.
func (i *Inverter) Reset() {
	i.Child.Reset()
}

// Succeeder always returns success regardless of child result.
// Use case: Optional actions that shouldn't fail the parent.
type Succeeder struct {
	BaseNode
	Child Node
}

// NewSucceeder creates a new Succeeder decorator.
func NewSucceeder(name string, child Node) *Succeeder {
	return &Succeeder{
		BaseNode: BaseNode{Name: name},
		Child:    child,
	}
}

// Execute always returns success after running the child.
func (s *Succeeder) Execute(ctx *Context) NodeStatus {
	status := s.Child.Execute(ctx)
	if status == StatusRunning {
		return StatusRunning
	}
	return StatusSuccess
}

// Reset resets the child node.
func (s *Succeeder) Reset() {
	s.Child.Reset()
}

// Failer always returns failure regardless of child result.
// Use case: Forcing a branch to fail for testing.
type Failer struct {
	BaseNode
	Child Node
}

// NewFailer creates a new Failer decorator.
func NewFailer(name string, child Node) *Failer {
	return &Failer{
		BaseNode: BaseNode{Name: name},
		Child:    child,
	}
}

// Execute always returns failure after running the child.
func (f *Failer) Execute(ctx *Context) NodeStatus {
	status := f.Child.Execute(ctx)
	if status == StatusRunning {
		return StatusRunning
	}
	return StatusFailure
}

// Reset resets the child node.
func (f *Failer) Reset() {
	f.Child.Reset()
}

// Repeater runs the child a specified number of times.
// Use case: Attack 3 times before switching behavior.
type Repeater struct {
	BaseNode
	Child        Node
	Times        int  // Number of times to repeat (-1 for infinite)
	currentCount int
	UntilSuccess bool // Stop repeating when child succeeds
	UntilFailure bool // Stop repeating when child fails
}

// NewRepeater creates a new Repeater decorator.
func NewRepeater(name string, child Node, times int) *Repeater {
	return &Repeater{
		BaseNode: BaseNode{Name: name},
		Child:    child,
		Times:    times,
	}
}

// NewRepeatUntilSuccess creates a repeater that stops when child succeeds.
func NewRepeatUntilSuccess(name string, child Node) *Repeater {
	return &Repeater{
		BaseNode:     BaseNode{Name: name},
		Child:        child,
		Times:        -1,
		UntilSuccess: true,
	}
}

// NewRepeatUntilFailure creates a repeater that stops when child fails.
func NewRepeatUntilFailure(name string, child Node) *Repeater {
	return &Repeater{
		BaseNode:     BaseNode{Name: name},
		Child:        child,
		Times:        -1,
		UntilFailure: true,
	}
}

// Execute repeats the child according to configuration.
func (r *Repeater) Execute(ctx *Context) NodeStatus {
	// Check if we've reached the limit
	if r.Times > 0 && r.currentCount >= r.Times {
		r.Reset()
		return StatusSuccess
	}

	status := r.Child.Execute(ctx)

	switch status {
	case StatusRunning:
		return StatusRunning
	case StatusSuccess:
		if r.UntilSuccess {
			r.Reset()
			return StatusSuccess
		}
		r.currentCount++
		r.Child.Reset()
		return StatusRunning
	case StatusFailure:
		if r.UntilFailure {
			r.Reset()
			return StatusSuccess
		}
		r.currentCount++
		r.Child.Reset()
		return StatusRunning
	}

	return StatusRunning
}

// Reset resets the repeater count and child.
func (r *Repeater) Reset() {
	r.currentCount = 0
	r.Child.Reset()
}

// Cooldown prevents the child from running more often than specified.
// Use case: Limit special ability usage.
type Cooldown struct {
	BaseNode
	Child         Node
	CooldownMs    int64 // Cooldown duration in milliseconds
	lastExecution int64 // Last successful execution time
}

// NewCooldown creates a new Cooldown decorator.
func NewCooldown(name string, child Node, cooldownMs int64) *Cooldown {
	return &Cooldown{
		BaseNode:   BaseNode{Name: name},
		Child:      child,
		CooldownMs: cooldownMs,
	}
}

// Execute runs the child only if cooldown has elapsed.
func (c *Cooldown) Execute(ctx *Context) NodeStatus {
	// Check if cooldown has elapsed
	if ctx.CurrentTime-c.lastExecution < c.CooldownMs {
		return StatusFailure
	}

	status := c.Child.Execute(ctx)

	if status == StatusSuccess {
		c.lastExecution = ctx.CurrentTime
	}

	return status
}

// Reset resets the child but NOT the cooldown timer.
func (c *Cooldown) Reset() {
	c.Child.Reset()
}

// ResetCooldown resets the cooldown timer.
func (c *Cooldown) ResetCooldown() {
	c.lastExecution = 0
}

// TimeLimit fails the child if it runs too long.
// Use case: Don't chase target forever.
type TimeLimit struct {
	BaseNode
	Child     Node
	LimitMs   int64 // Maximum execution time in milliseconds
	startTime int64
	isRunning bool
}

// NewTimeLimit creates a new TimeLimit decorator.
func NewTimeLimit(name string, child Node, limitMs int64) *TimeLimit {
	return &TimeLimit{
		BaseNode: BaseNode{Name: name},
		Child:    child,
		LimitMs:  limitMs,
	}
}

// Execute runs the child with a time limit.
func (t *TimeLimit) Execute(ctx *Context) NodeStatus {
	if !t.isRunning {
		t.startTime = ctx.CurrentTime
		t.isRunning = true
	}

	// Check if time limit exceeded
	if ctx.CurrentTime-t.startTime > t.LimitMs {
		t.Reset()
		return StatusFailure
	}

	status := t.Child.Execute(ctx)

	if status != StatusRunning {
		t.Reset()
	}

	return status
}

// Reset resets the time limit state and child.
func (t *TimeLimit) Reset() {
	t.isRunning = false
	t.startTime = 0
	t.Child.Reset()
}

// ConditionalDecorator only runs the child if a condition is met.
// More flexible than using a Sequence with a condition node.
type ConditionalDecorator struct {
	BaseNode
	Child     Node
	Condition func(ctx *Context) bool
}

// NewConditionalDecorator creates a new ConditionalDecorator.
func NewConditionalDecorator(name string, child Node, condition func(ctx *Context) bool) *ConditionalDecorator {
	return &ConditionalDecorator{
		BaseNode:  BaseNode{Name: name},
		Child:     child,
		Condition: condition,
	}
}

// Execute runs the child only if condition is true.
func (c *ConditionalDecorator) Execute(ctx *Context) NodeStatus {
	if !c.Condition(ctx) {
		return StatusFailure
	}
	return c.Child.Execute(ctx)
}

// Reset resets the child.
func (c *ConditionalDecorator) Reset() {
	c.Child.Reset()
}
