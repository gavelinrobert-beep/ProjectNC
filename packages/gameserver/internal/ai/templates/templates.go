// Package templates provides NPC type configurations and behavior tree templates.
// These templates define how different types of NPCs behave in the game world.
package templates

import (
	"math/rand"

	bt "github.com/mmorpg/gameserver/internal/ai/behaviortree"
	"github.com/mmorpg/gameserver/internal/ai/actions"
	"github.com/mmorpg/gameserver/internal/ai/conditions"
	"github.com/mmorpg/gameserver/internal/ai/perception"
)

// NPCType identifies the category of NPC behavior.
type NPCType string

const (
	NPCTypePassive     NPCType = "PASSIVE"     // Passive animals (deer, rabbit)
	NPCTypeNeutral     NPCType = "NEUTRAL"     // Neutral humanoids (merchants, civilians)
	NPCTypeAggressive  NPCType = "AGGRESSIVE"  // Aggressive monsters
	NPCTypeElite       NPCType = "ELITE"       // Elite monsters with special abilities
	NPCTypeBoss        NPCType = "BOSS"        // Boss monsters
	NPCTypeGuard       NPCType = "GUARD"       // Guards that protect areas
)

// NPCTemplate defines the complete configuration for an NPC type.
type NPCTemplate struct {
	// Identification
	Type        NPCType
	Name        string
	Description string

	// Base Stats
	BaseStats NPCStats

	// Perception Configuration
	PerceptionConfig perception.PerceptionConfig

	// Behavior Configuration
	BehaviorConfig BehaviorConfig

	// Combat Configuration
	CombatConfig CombatConfig

	// Faction
	Faction perception.Faction
}

// NPCStats holds the base statistics for an NPC.
type NPCStats struct {
	Level         int
	Health        int
	Mana          int
	Strength      int
	Agility       int
	Intellect     int
	Stamina       int
	Spirit        int
	MovementSpeed float64 // Units per second
	AttackSpeed   int64   // Milliseconds between attacks
}

// BehaviorConfig defines behavior parameters.
type BehaviorConfig struct {
	WanderRadius     float64 // How far the NPC can wander from home
	WanderMinWait    int64   // Minimum wait time between wanders (ms)
	WanderMaxWait    int64   // Maximum wait time between wanders (ms)
	ChaseMaxDistance float64 // Maximum distance to chase a target
	ChaseMaxTime     int64   // Maximum chase duration (ms)
	LeashRadius      float64 // Distance from home before resetting
	CallForHelp      bool    // Whether NPC calls nearby allies
	CallRadius       float64 // Radius for calling help
	FleeAtHealth     float64 // Health percentage to start fleeing (0 = never)
}

// CombatConfig defines combat parameters.
type CombatConfig struct {
	AttackRange    float64  // Maximum attack range
	Abilities      []string // List of ability IDs the NPC can use
	DefaultAbility string   // Primary attack ability
}

// ========================================
// Predefined NPC Templates
// ========================================

// PassiveAnimalTemplate creates a template for passive animals like deer or rabbits.
func PassiveAnimalTemplate(name string, level int) *NPCTemplate {
	return &NPCTemplate{
		Type:        NPCTypePassive,
		Name:        name,
		Description: "A passive creature that flees when attacked",
		Faction:     perception.FactionWildlife,

		BaseStats: NPCStats{
			Level:         level,
			Health:        50 + level*10,
			Mana:          0,
			Strength:      5 + level,
			Agility:       10 + level*2,
			Intellect:     1,
			Stamina:       5 + level,
			Spirit:        5,
			MovementSpeed: 6.0,
			AttackSpeed:   2000,
		},

		PerceptionConfig: perception.PerceptionConfig{
			VisionRange:       25.0,
			VisionAngle:       270.0, // Wide field of view for prey animals
			AggroRadius:       0,     // Passive - never aggros
			LeashRadius:       30.0,
			IgnoreLineOfSight: false,
			DetectionDelay:    0,
			StealthDetection:  0.5,
		},

		BehaviorConfig: BehaviorConfig{
			WanderRadius:     15.0,
			WanderMinWait:    3000,
			WanderMaxWait:    8000,
			ChaseMaxDistance: 0, // Never chases
			ChaseMaxTime:     0,
			LeashRadius:      30.0,
			CallForHelp:      false,
			FleeAtHealth:     1.0, // Always flees when attacked
		},

		CombatConfig: CombatConfig{
			AttackRange:    0,   // No attacks
			Abilities:      nil,
			DefaultAbility: "",
		},
	}
}

// NeutralHumanoidTemplate creates a template for neutral NPCs like merchants.
func NeutralHumanoidTemplate(name string, level int) *NPCTemplate {
	return &NPCTemplate{
		Type:        NPCTypeNeutral,
		Name:        name,
		Description: "A neutral humanoid that defends itself when attacked",
		Faction:     perception.FactionNeutral,

		BaseStats: NPCStats{
			Level:         level,
			Health:        100 + level*20,
			Mana:          50 + level*10,
			Strength:      10 + level*2,
			Agility:       8 + level,
			Intellect:     10 + level,
			Stamina:       10 + level*2,
			Spirit:        10 + level,
			MovementSpeed: 5.0,
			AttackSpeed:   2500,
		},

		PerceptionConfig: perception.PerceptionConfig{
			VisionRange:       20.0,
			VisionAngle:       120.0,
			AggroRadius:       0, // Neutral - only fights back
			LeashRadius:       25.0,
			IgnoreLineOfSight: false,
			DetectionDelay:    500,
			StealthDetection:  1.0,
		},

		BehaviorConfig: BehaviorConfig{
			WanderRadius:     5.0, // Stays close to home
			WanderMinWait:    5000,
			WanderMaxWait:    15000,
			ChaseMaxDistance: 15.0,
			ChaseMaxTime:     5000,
			LeashRadius:      25.0,
			CallForHelp:      true,
			CallRadius:       15.0,
			FleeAtHealth:     0.2, // Flees at 20% health
		},

		CombatConfig: CombatConfig{
			AttackRange:    3.0,
			Abilities:      []string{"basic_attack"},
			DefaultAbility: "basic_attack",
		},
	}
}

// AggressiveMonsterTemplate creates a template for aggressive monsters.
func AggressiveMonsterTemplate(name string, level int) *NPCTemplate {
	return &NPCTemplate{
		Type:        NPCTypeAggressive,
		Name:        name,
		Description: "An aggressive monster that attacks on sight",
		Faction:     perception.FactionHostile,

		BaseStats: NPCStats{
			Level:         level,
			Health:        150 + level*30,
			Mana:          30 + level*5,
			Strength:      15 + level*3,
			Agility:       10 + level*2,
			Intellect:     5 + level,
			Stamina:       15 + level*3,
			Spirit:        5 + level,
			MovementSpeed: 5.5,
			AttackSpeed:   2000,
		},

		PerceptionConfig: perception.PerceptionConfig{
			VisionRange:       30.0,
			VisionAngle:       140.0,
			AggroRadius:       15.0, // Engages when players get close
			LeashRadius:       40.0,
			IgnoreLineOfSight: false,
			DetectionDelay:    0,
			StealthDetection:  1.0,
		},

		BehaviorConfig: BehaviorConfig{
			WanderRadius:     10.0,
			WanderMinWait:    2000,
			WanderMaxWait:    6000,
			ChaseMaxDistance: 35.0,
			ChaseMaxTime:     15000,
			LeashRadius:      40.0,
			CallForHelp:      true,
			CallRadius:       20.0,
			FleeAtHealth:     0, // Never flees
		},

		CombatConfig: CombatConfig{
			AttackRange:    3.0,
			Abilities:      []string{"basic_attack", "power_attack"},
			DefaultAbility: "basic_attack",
		},
	}
}

// EliteMonsterTemplate creates a template for elite monsters with special abilities.
func EliteMonsterTemplate(name string, level int) *NPCTemplate {
	return &NPCTemplate{
		Type:        NPCTypeElite,
		Name:        name,
		Description: "A powerful elite monster with special abilities",
		Faction:     perception.FactionHostile,

		BaseStats: NPCStats{
			Level:         level,
			Health:        500 + level*100, // 3-4x normal health
			Mana:          100 + level*20,
			Strength:      25 + level*5,
			Agility:       15 + level*3,
			Intellect:     15 + level*3,
			Stamina:       30 + level*6,
			Spirit:        15 + level*2,
			MovementSpeed: 6.0,
			AttackSpeed:   1800,
		},

		PerceptionConfig: perception.PerceptionConfig{
			VisionRange:       40.0,
			VisionAngle:       180.0,
			AggroRadius:       20.0,
			LeashRadius:       50.0,
			IgnoreLineOfSight: false,
			DetectionDelay:    0,
			StealthDetection:  1.5, // Better at detecting stealth
		},

		BehaviorConfig: BehaviorConfig{
			WanderRadius:     8.0,
			WanderMinWait:    3000,
			WanderMaxWait:    8000,
			ChaseMaxDistance: 45.0,
			ChaseMaxTime:     20000,
			LeashRadius:      50.0,
			CallForHelp:      true,
			CallRadius:       30.0,
			FleeAtHealth:     0,
		},

		CombatConfig: CombatConfig{
			AttackRange:    4.0,
			Abilities:      []string{"basic_attack", "power_attack", "cleave", "enrage"},
			DefaultAbility: "basic_attack",
		},
	}
}

// BossMonsterTemplate creates a template for boss monsters.
func BossMonsterTemplate(name string, level int) *NPCTemplate {
	return &NPCTemplate{
		Type:        NPCTypeBoss,
		Name:        name,
		Description: "A boss monster with multiple phases and abilities",
		Faction:     perception.FactionHostile,

		BaseStats: NPCStats{
			Level:         level,
			Health:        2000 + level*400, // Massive health pool
			Mana:          500 + level*100,
			Strength:      50 + level*10,
			Agility:       30 + level*5,
			Intellect:     40 + level*8,
			Stamina:       80 + level*15,
			Spirit:        40 + level*5,
			MovementSpeed: 5.0,
			AttackSpeed:   1500,
		},

		PerceptionConfig: perception.PerceptionConfig{
			VisionRange:       50.0,
			VisionAngle:       360.0, // Sees all around
			AggroRadius:       25.0,
			LeashRadius:       60.0,
			IgnoreLineOfSight: true, // Bosses see through walls
			DetectionDelay:    0,
			StealthDetection:  2.0,
		},

		BehaviorConfig: BehaviorConfig{
			WanderRadius:     0,   // Bosses don't wander
			WanderMinWait:    0,
			WanderMaxWait:    0,
			ChaseMaxDistance: 55.0,
			ChaseMaxTime:     30000,
			LeashRadius:      60.0,
			CallForHelp:      false, // Bosses fight alone
			FleeAtHealth:     0,
		},

		CombatConfig: CombatConfig{
			AttackRange:    5.0,
			Abilities:      []string{"basic_attack", "power_attack", "cleave", "enrage", "summon_adds", "aoe_attack"},
			DefaultAbility: "basic_attack",
		},
	}
}

// ========================================
// Behavior Tree Builders
// ========================================

// BuildPassiveBehaviorTree creates a behavior tree for passive animals.
func BuildPassiveBehaviorTree(template *NPCTemplate) bt.Node {
	randFunc := func() float64 { return rand.Float64() }

	return bt.NewSelector("Root",
		// Priority 1: Flee if attacked
		bt.NewSequence("FleeFromDanger",
			conditions.NewHasThreatCondition("HasThreat"),
			actions.NewFleeAction("Flee", 30.0),
		),

		// Priority 2: Return home if too far
		bt.NewSequence("ReturnHome",
			conditions.NewTooFarFromHomeCondition("TooFar", template.BehaviorConfig.LeashRadius),
			actions.NewReturnToSpawnAction("GoHome", 1.0),
		),

		// Priority 3: Wander peacefully
		actions.NewWanderAction("Wander",
			template.BehaviorConfig.WanderRadius,
			template.BehaviorConfig.WanderMinWait,
			template.BehaviorConfig.WanderMaxWait,
			randFunc,
		),
	)
}

// BuildNeutralBehaviorTree creates a behavior tree for neutral NPCs.
func BuildNeutralBehaviorTree(template *NPCTemplate) bt.Node {
	randFunc := func() float64 { return rand.Float64() }

	return bt.NewSelector("Root",
		// Priority 1: Evade if too far from home
		bt.NewSequence("Evade",
			conditions.NewIsEvadingCondition("IsEvading"),
			actions.NewReturnToSpawnAction("ReturnToSpawn", 1.0),
		),

		// Priority 2: Flee if low health
		bt.NewSequence("FleeWhenLow",
			conditions.NewLowHealthCondition("LowHealth", template.BehaviorConfig.FleeAtHealth),
			actions.NewFleeAction("Flee", 20.0),
		),

		// Priority 3: Fight back if attacked
		bt.NewSequence("DefendSelf",
			conditions.NewHasThreatCondition("HasThreat"),
			bt.NewSelector("CombatActions",
				// Attack if in range
				bt.NewSequence("AttackTarget",
					actions.NewSelectTargetAction("SelectTarget"),
					conditions.NewTargetInRangeCondition("InRange", template.CombatConfig.AttackRange),
					actions.NewAttackTargetAction("Attack", template.CombatConfig.DefaultAbility, template.CombatConfig.AttackRange, template.BaseStats.AttackSpeed),
				),
				// Chase if out of range
				bt.NewSequence("ChaseTarget",
					actions.NewSelectTargetAction("SelectTarget"),
					conditions.NewTooFarFromHomeCondition("NotTooFar", template.BehaviorConfig.LeashRadius),
					actions.NewChaseTargetAction("Chase", template.CombatConfig.AttackRange, template.BehaviorConfig.ChaseMaxTime),
				),
				// Evade if chased too far
				bt.NewSequence("StartEvade",
					conditions.NewTooFarFromHomeCondition("TooFar", template.BehaviorConfig.LeashRadius),
					actions.NewClearTargetAction("ClearTarget"),
					bt.NewActionNode("SetEvading", func(ctx *bt.Context) bt.NodeStatus {
						ctx.Blackboard.Set(bt.KeyIsEvading, true)
						return bt.StatusSuccess
					}),
				),
			),
		),

		// Priority 4: Wander when idle
		actions.NewWanderAction("Wander",
			template.BehaviorConfig.WanderRadius,
			template.BehaviorConfig.WanderMinWait,
			template.BehaviorConfig.WanderMaxWait,
			randFunc,
		),
	)
}

// BuildAggressiveBehaviorTree creates a behavior tree for aggressive monsters.
func BuildAggressiveBehaviorTree(template *NPCTemplate) bt.Node {
	randFunc := func() float64 { return rand.Float64() }

	return bt.NewSelector("Root",
		// Priority 1: Evade - return to spawn
		bt.NewSequence("Evade",
			conditions.NewIsEvadingCondition("IsEvading"),
			actions.NewClearTargetAction("ClearTarget"),
			actions.NewReturnToSpawnAction("ReturnToSpawn", 1.0),
		),

		// Priority 2: Combat behavior
		bt.NewSequence("Combat",
			conditions.NewHasAggroTargetCondition("HasTarget"),
			bt.NewSelector("CombatDecisions",
				// Check if should evade (too far from home)
				bt.NewSequence("CheckLeash",
					conditions.NewTooFarFromHomeCondition("TooFar", template.BehaviorConfig.LeashRadius),
					bt.NewActionNode("SetEvading", func(ctx *bt.Context) bt.NodeStatus {
						ctx.Blackboard.Set(bt.KeyIsEvading, true)
						return bt.StatusSuccess
					}),
				),

				// Call for help
				bt.NewSequence("CallHelp",
					bt.NewConditionNode("ShouldCallHelp", func(ctx *bt.Context) bool {
						return template.BehaviorConfig.CallForHelp
					}),
					bt.NewCooldown("CallCooldown",
						actions.NewCallForHelpAction("CallForHelp", template.BehaviorConfig.CallRadius),
						10000, // 10 second cooldown
					),
				),

				// Attack if in range
				bt.NewSequence("AttackTarget",
					conditions.NewTargetInRangeCondition("InRange", template.CombatConfig.AttackRange),
					actions.NewAttackTargetAction("Attack", template.CombatConfig.DefaultAbility, template.CombatConfig.AttackRange, template.BaseStats.AttackSpeed),
				),

				// Chase target
				actions.NewChaseTargetAction("Chase", template.CombatConfig.AttackRange*0.8, template.BehaviorConfig.ChaseMaxTime),
			),
		),

		// Priority 3: Look for targets
		bt.NewSequence("SeekTargets",
			conditions.NewPlayerDetectedCondition("PlayerNearby", template.PerceptionConfig.AggroRadius),
			actions.NewSelectTargetAction("SelectTarget"),
			bt.NewActionNode("EnterCombat", func(ctx *bt.Context) bt.NodeStatus {
				ctx.Blackboard.Set(bt.KeyIsInCombat, true)
				return bt.StatusSuccess
			}),
		),

		// Priority 4: Wander when idle
		actions.NewWanderAction("Wander",
			template.BehaviorConfig.WanderRadius,
			template.BehaviorConfig.WanderMinWait,
			template.BehaviorConfig.WanderMaxWait,
			randFunc,
		),
	)
}

// BuildEliteBehaviorTree creates a behavior tree for elite monsters.
// Elites have more complex combat behavior with special abilities.
func BuildEliteBehaviorTree(template *NPCTemplate) bt.Node {
	randFunc := func() float64 { return rand.Float64() }

	return bt.NewSelector("Root",
		// Priority 1: Evade
		bt.NewSequence("Evade",
			conditions.NewIsEvadingCondition("IsEvading"),
			actions.NewClearTargetAction("ClearTarget"),
			actions.NewReturnToSpawnAction("ReturnToSpawn", 1.0),
		),

		// Priority 2: Combat
		bt.NewSequence("Combat",
			conditions.NewHasAggroTargetCondition("HasTarget"),
			bt.NewSelector("CombatDecisions",
				// Leash check
				bt.NewSequence("CheckLeash",
					conditions.NewTooFarFromHomeCondition("TooFar", template.BehaviorConfig.LeashRadius),
					bt.NewActionNode("SetEvading", func(ctx *bt.Context) bt.NodeStatus {
						ctx.Blackboard.Set(bt.KeyIsEvading, true)
						return bt.StatusSuccess
					}),
				),

				// Use enrage at low health
				bt.NewSequence("Enrage",
					conditions.NewLowHealthCondition("LowHealth", 0.3),
					bt.NewConditionNode("HasEnrage", func(ctx *bt.Context) bool {
						for _, ability := range template.CombatConfig.Abilities {
							if ability == "enrage" {
								return true
							}
						}
						return false
					}),
					bt.NewCooldown("EnrageCooldown",
						actions.NewAttackTargetAction("UseEnrage", "enrage", 0, 60000),
						60000,
					),
				),

				// Use special ability randomly
				bt.NewSequence("SpecialAbility",
					conditions.NewRandomChanceCondition("SpecialChance", 0.2, randFunc),
					conditions.NewTargetInRangeCondition("InRange", template.CombatConfig.AttackRange),
					actions.NewAttackTargetAction("SpecialAttack", "power_attack", template.CombatConfig.AttackRange, 5000),
				),

				// Normal attack
				bt.NewSequence("NormalAttack",
					conditions.NewTargetInRangeCondition("InRange", template.CombatConfig.AttackRange),
					actions.NewAttackTargetAction("Attack", template.CombatConfig.DefaultAbility, template.CombatConfig.AttackRange, template.BaseStats.AttackSpeed),
				),

				// Chase
				actions.NewChaseTargetAction("Chase", template.CombatConfig.AttackRange*0.8, template.BehaviorConfig.ChaseMaxTime),
			),
		),

		// Priority 3: Seek targets
		bt.NewSequence("SeekTargets",
			conditions.NewPlayerDetectedCondition("PlayerNearby", template.PerceptionConfig.AggroRadius),
			actions.NewSelectTargetAction("SelectTarget"),
			bt.NewActionNode("EnterCombat", func(ctx *bt.Context) bt.NodeStatus {
				ctx.Blackboard.Set(bt.KeyIsInCombat, true)
				return bt.StatusSuccess
			}),
		),

		// Priority 4: Patrol or wander
		actions.NewWanderAction("Wander",
			template.BehaviorConfig.WanderRadius,
			template.BehaviorConfig.WanderMinWait,
			template.BehaviorConfig.WanderMaxWait,
			randFunc,
		),
	)
}

// GetBehaviorTree returns the appropriate behavior tree for an NPC type.
func GetBehaviorTree(template *NPCTemplate) bt.Node {
	switch template.Type {
	case NPCTypePassive:
		return BuildPassiveBehaviorTree(template)
	case NPCTypeNeutral:
		return BuildNeutralBehaviorTree(template)
	case NPCTypeAggressive:
		return BuildAggressiveBehaviorTree(template)
	case NPCTypeElite, NPCTypeBoss:
		return BuildEliteBehaviorTree(template)
	default:
		return BuildNeutralBehaviorTree(template)
	}
}
