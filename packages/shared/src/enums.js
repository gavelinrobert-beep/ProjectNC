"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatEventType = exports.EntityType = exports.QuestStatus = exports.EquipmentSlot = exports.ItemRarity = exports.ItemType = exports.Class = exports.Race = void 0;
var Race;
(function (Race) {
    Race["HUMAN"] = "HUMAN";
    Race["ELF"] = "ELF";
    Race["DWARF"] = "DWARF";
    Race["ORC"] = "ORC";
})(Race || (exports.Race = Race = {}));
var Class;
(function (Class) {
    Class["WARRIOR"] = "WARRIOR";
    Class["MAGE"] = "MAGE";
    Class["ROGUE"] = "ROGUE";
    Class["PRIEST"] = "PRIEST";
})(Class || (exports.Class = Class = {}));
var ItemType;
(function (ItemType) {
    ItemType["WEAPON"] = "WEAPON";
    ItemType["ARMOR"] = "ARMOR";
    ItemType["CONSUMABLE"] = "CONSUMABLE";
    ItemType["QUEST_ITEM"] = "QUEST_ITEM";
    ItemType["MATERIAL"] = "MATERIAL";
})(ItemType || (exports.ItemType = ItemType = {}));
var ItemRarity;
(function (ItemRarity) {
    ItemRarity["COMMON"] = "COMMON";
    ItemRarity["UNCOMMON"] = "UNCOMMON";
    ItemRarity["RARE"] = "RARE";
    ItemRarity["EPIC"] = "EPIC";
    ItemRarity["LEGENDARY"] = "LEGENDARY";
})(ItemRarity || (exports.ItemRarity = ItemRarity = {}));
var EquipmentSlot;
(function (EquipmentSlot) {
    EquipmentSlot["HEAD"] = "HEAD";
    EquipmentSlot["CHEST"] = "CHEST";
    EquipmentSlot["LEGS"] = "LEGS";
    EquipmentSlot["FEET"] = "FEET";
    EquipmentSlot["HANDS"] = "HANDS";
    EquipmentSlot["MAIN_HAND"] = "MAIN_HAND";
    EquipmentSlot["OFF_HAND"] = "OFF_HAND";
    EquipmentSlot["NECK"] = "NECK";
    EquipmentSlot["RING_1"] = "RING_1";
    EquipmentSlot["RING_2"] = "RING_2";
})(EquipmentSlot || (exports.EquipmentSlot = EquipmentSlot = {}));
var QuestStatus;
(function (QuestStatus) {
    QuestStatus["AVAILABLE"] = "AVAILABLE";
    QuestStatus["IN_PROGRESS"] = "IN_PROGRESS";
    QuestStatus["COMPLETED"] = "COMPLETED";
    QuestStatus["TURNED_IN"] = "TURNED_IN";
})(QuestStatus || (exports.QuestStatus = QuestStatus = {}));
var EntityType;
(function (EntityType) {
    EntityType["PLAYER"] = "PLAYER";
    EntityType["NPC"] = "NPC";
    EntityType["MONSTER"] = "MONSTER";
    EntityType["OBJECT"] = "OBJECT";
})(EntityType || (exports.EntityType = EntityType = {}));
var CombatEventType;
(function (CombatEventType) {
    CombatEventType["DAMAGE"] = "DAMAGE";
    CombatEventType["HEAL"] = "HEAL";
    CombatEventType["BUFF"] = "BUFF";
    CombatEventType["DEBUFF"] = "DEBUFF";
    CombatEventType["DEATH"] = "DEATH";
})(CombatEventType || (exports.CombatEventType = CombatEventType = {}));
//# sourceMappingURL=enums.js.map