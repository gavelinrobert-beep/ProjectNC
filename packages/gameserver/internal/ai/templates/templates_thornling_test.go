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
