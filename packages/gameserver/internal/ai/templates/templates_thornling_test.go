package templates

import "testing"

func TestThornlingSkirmisherTemplate(t *testing.T) {
	template := ThornlingSkirmisherTemplate(1)

	if template.Name != "Thornling Skirmisher" {
		t.Fatalf("unexpected name: %s", template.Name)
	}

	if template.Type != NPCTypeAggressive {
		t.Fatalf("expected aggressive NPC type, got %s", template.Type)
	}

	if template.BaseStats.Health > 120 {
		t.Fatalf("expected low health for early-game enemy, got %d", template.BaseStats.Health)
	}

	if template.CombatConfig.DefaultAbility != "basic_attack" {
		t.Fatalf("expected basic attack default ability, got %s", template.CombatConfig.DefaultAbility)
	}

	if len(template.CombatConfig.Abilities) != 1 || template.CombatConfig.Abilities[0] != "basic_attack" {
		t.Fatalf("expected only basic attack ability, got %v", template.CombatConfig.Abilities)
	}

	if template.CombatConfig.AttackRange > 2.5 {
		t.Fatalf("expected melee attack range, got %f", template.CombatConfig.AttackRange)
	}

	if template.BehaviorConfig.CallForHelp {
		t.Fatalf("thornling skirmisher should not call for help in its simple AI config")
	}
}

func TestGroveStalkerTemplate(t *testing.T) {
	template := GroveStalkerTemplate(1)

	if template.Name != "Grove Stalker" {
		t.Fatalf("unexpected name: %s", template.Name)
	}

	if template.Type != NPCTypeAggressive {
		t.Fatalf("expected aggressive NPC type, got %s", template.Type)
	}

	if template.BaseStats.Health >= 120 {
		t.Fatalf("expected low survivability health, got %d", template.BaseStats.Health)
	}

	if template.CombatConfig.DefaultAbility != "firebolt" {
		t.Fatalf("expected firebolt default ability, got %s", template.CombatConfig.DefaultAbility)
	}

	if len(template.CombatConfig.Abilities) != 1 || template.CombatConfig.Abilities[0] != "firebolt" {
		t.Fatalf("expected only firebolt ability, got %v", template.CombatConfig.Abilities)
	}

	if template.CombatConfig.AttackRange <= 12.0 {
		t.Fatalf("expected ranged attack range, got %f", template.CombatConfig.AttackRange)
	}

	if template.PerceptionConfig.AggroRadius <= template.CombatConfig.AttackRange {
		t.Fatalf("expected grove stalker to open from distance, aggro radius %f attack range %f", template.PerceptionConfig.AggroRadius, template.CombatConfig.AttackRange)
	}

	if template.BehaviorConfig.FleeAtHealth <= 0 {
		t.Fatalf("expected grove stalker to consider fleeing due to low survivability")
	}
}
