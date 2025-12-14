"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceType = exports.ModifierOperation = exports.ModifierType = exports.TalentNodeType = exports.SpellUnlockType = exports.CastType = exports.TargetType = exports.SpellType = exports.SpellSchool = void 0;
var SpellSchool;
(function (SpellSchool) {
    SpellSchool["PHYSICAL"] = "PHYSICAL";
    SpellSchool["FIRE"] = "FIRE";
    SpellSchool["FROST"] = "FROST";
    SpellSchool["ARCANE"] = "ARCANE";
    SpellSchool["NATURE"] = "NATURE";
    SpellSchool["SHADOW"] = "SHADOW";
    SpellSchool["HOLY"] = "HOLY";
})(SpellSchool || (exports.SpellSchool = SpellSchool = {}));
var SpellType;
(function (SpellType) {
    SpellType["DAMAGE"] = "DAMAGE";
    SpellType["HEAL"] = "HEAL";
    SpellType["BUFF"] = "BUFF";
    SpellType["DEBUFF"] = "DEBUFF";
    SpellType["UTILITY"] = "UTILITY";
    SpellType["SUMMON"] = "SUMMON";
    SpellType["TRANSFORM"] = "TRANSFORM";
})(SpellType || (exports.SpellType = SpellType = {}));
var TargetType;
(function (TargetType) {
    TargetType["SELF"] = "SELF";
    TargetType["SINGLE_ENEMY"] = "SINGLE_ENEMY";
    TargetType["SINGLE_ALLY"] = "SINGLE_ALLY";
    TargetType["SINGLE_ANY"] = "SINGLE_ANY";
    TargetType["AOE_ENEMY"] = "AOE_ENEMY";
    TargetType["AOE_ALLY"] = "AOE_ALLY";
    TargetType["AOE_ALL"] = "AOE_ALL";
    TargetType["CONE"] = "CONE";
    TargetType["LINE"] = "LINE";
    TargetType["GROUND"] = "GROUND";
})(TargetType || (exports.TargetType = TargetType = {}));
var CastType;
(function (CastType) {
    CastType["INSTANT"] = "INSTANT";
    CastType["CAST"] = "CAST";
    CastType["CHANNEL"] = "CHANNEL";
})(CastType || (exports.CastType = CastType = {}));
var SpellUnlockType;
(function (SpellUnlockType) {
    SpellUnlockType["LEVEL"] = "LEVEL";
    SpellUnlockType["QUEST"] = "QUEST";
    SpellUnlockType["TALENT"] = "TALENT";
    SpellUnlockType["TRAINER"] = "TRAINER";
    SpellUnlockType["ITEM"] = "ITEM";
    SpellUnlockType["CLASS_QUEST"] = "CLASS_QUEST";
})(SpellUnlockType || (exports.SpellUnlockType = SpellUnlockType = {}));
var TalentNodeType;
(function (TalentNodeType) {
    TalentNodeType["PASSIVE"] = "PASSIVE";
    TalentNodeType["SPELL"] = "SPELL";
    TalentNodeType["MODIFIER"] = "MODIFIER";
    TalentNodeType["PROC"] = "PROC";
})(TalentNodeType || (exports.TalentNodeType = TalentNodeType = {}));
var ModifierType;
(function (ModifierType) {
    ModifierType["DAMAGE"] = "DAMAGE";
    ModifierType["HEALING"] = "HEALING";
    ModifierType["COOLDOWN"] = "COOLDOWN";
    ModifierType["CAST_TIME"] = "CAST_TIME";
    ModifierType["MANA_COST"] = "MANA_COST";
    ModifierType["CRIT_CHANCE"] = "CRIT_CHANCE";
    ModifierType["CRIT_DAMAGE"] = "CRIT_DAMAGE";
    ModifierType["RANGE"] = "RANGE";
    ModifierType["DURATION"] = "DURATION";
    ModifierType["DOT_TICK"] = "DOT_TICK";
    ModifierType["AOE_RADIUS"] = "AOE_RADIUS";
})(ModifierType || (exports.ModifierType = ModifierType = {}));
var ModifierOperation;
(function (ModifierOperation) {
    ModifierOperation["ADD"] = "ADD";
    ModifierOperation["MULTIPLY"] = "MULTIPLY";
    ModifierOperation["SET"] = "SET";
})(ModifierOperation || (exports.ModifierOperation = ModifierOperation = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["MANA"] = "MANA";
    ResourceType["RAGE"] = "RAGE";
    ResourceType["ENERGY"] = "ENERGY";
    ResourceType["FOCUS"] = "FOCUS";
    ResourceType["COMBO_POINTS"] = "COMBO_POINTS";
    ResourceType["HEALTH"] = "HEALTH";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
//# sourceMappingURL=enums.js.map