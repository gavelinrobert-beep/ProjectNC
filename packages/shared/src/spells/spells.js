"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpellCastError = void 0;
exports.getCurrentSpellRank = getCurrentSpellRank;
exports.getNextLearnableRank = getNextLearnableRank;
exports.applySpellModifiers = applySpellModifiers;
const enums_1 = require("./enums");
var SpellCastError;
(function (SpellCastError) {
    SpellCastError["NOT_LEARNED"] = "NOT_LEARNED";
    SpellCastError["ON_COOLDOWN"] = "ON_COOLDOWN";
    SpellCastError["NOT_ENOUGH_MANA"] = "NOT_ENOUGH_MANA";
    SpellCastError["INVALID_TARGET"] = "INVALID_TARGET";
    SpellCastError["OUT_OF_RANGE"] = "OUT_OF_RANGE";
    SpellCastError["TARGET_DEAD"] = "TARGET_DEAD";
    SpellCastError["SILENCED"] = "SILENCED";
    SpellCastError["MOVING"] = "MOVING";
    SpellCastError["ALREADY_CASTING"] = "ALREADY_CASTING";
    SpellCastError["LINE_OF_SIGHT"] = "LINE_OF_SIGHT";
    SpellCastError["TARGET_IMMUNE"] = "TARGET_IMMUNE";
})(SpellCastError || (exports.SpellCastError = SpellCastError = {}));
function getCurrentSpellRank(spell, learnedSpell) {
    const rankIndex = learnedSpell.maxRankLearned - 1;
    if (rankIndex >= 0 && rankIndex < spell.ranks.length) {
        return spell.ranks[rankIndex];
    }
    return null;
}
function getNextLearnableRank(spell, learnedSpell, characterLevel) {
    const currentRank = learnedSpell?.maxRankLearned ?? 0;
    const nextRankIndex = currentRank;
    if (nextRankIndex >= spell.ranks.length) {
        return null;
    }
    const nextRank = spell.ranks[nextRankIndex];
    if (nextRank.levelRequired <= characterLevel) {
        return nextRank;
    }
    return null;
}
function applySpellModifiers(baseValue, modifiers, modifierType) {
    let result = baseValue;
    const sortedModifiers = [...modifiers]
        .filter((m) => m.modifierType === modifierType)
        .sort((a, b) => a.priority - b.priority);
    for (const mod of sortedModifiers) {
        switch (mod.operation) {
            case enums_1.ModifierOperation.ADD:
                result += mod.value;
                break;
            case enums_1.ModifierOperation.MULTIPLY:
                result *= mod.value;
                break;
            case enums_1.ModifierOperation.SET:
                result = mod.value;
                break;
        }
    }
    return result;
}
//# sourceMappingURL=spells.js.map