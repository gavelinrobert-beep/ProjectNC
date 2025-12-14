"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TALENT_START_LEVEL = void 0;
exports.getTalentPointsForLevel = getTalentPointsForLevel;
exports.getSpentPoints = getSpentPoints;
exports.canAllocatePoint = canAllocatePoint;
exports.canDeallocatePoint = canDeallocatePoint;
exports.generateTalentModifiers = generateTalentModifiers;
exports.getTalentValueAtRank = getTalentValueAtRank;
exports.formatTalentDescription = formatTalentDescription;
exports.calculateRespecCost = calculateRespecCost;
const enums_1 = require("./enums");
exports.TALENT_START_LEVEL = 10;
const TALENT_LEVEL_OFFSET = 9;
function getTalentPointsForLevel(level) {
    if (level < exports.TALENT_START_LEVEL)
        return 0;
    return level - TALENT_LEVEL_OFFSET;
}
function getSpentPoints(allocation) {
    return Object.values(allocation.allocations).reduce((sum, points) => sum + points, 0);
}
function canAllocatePoint(spec, node, allocation, characterLevel) {
    const totalPoints = getTalentPointsForLevel(characterLevel);
    const spentPoints = getSpentPoints(allocation);
    if (spentPoints >= totalPoints) {
        return { canAllocate: false, reason: 'No talent points available' };
    }
    const currentPoints = allocation.allocations[node.id] || 0;
    if (currentPoints >= node.maxPoints) {
        return { canAllocate: false, reason: 'Talent already at maximum rank' };
    }
    const specTotal = allocation.specTotals[spec.id] || 0;
    if (specTotal < node.requiredTreePoints) {
        return {
            canAllocate: false,
            reason: `Requires ${node.requiredTreePoints} points in ${spec.name}`,
        };
    }
    for (const prereqId of node.prerequisites) {
        const prereqNode = spec.nodes.find((n) => n.id === prereqId);
        if (!prereqNode)
            continue;
        const prereqPoints = allocation.allocations[prereqId] || 0;
        if (prereqPoints < prereqNode.maxPoints) {
            return {
                canAllocate: false,
                reason: `Requires ${prereqNode.name} (${prereqPoints}/${prereqNode.maxPoints})`,
            };
        }
    }
    return { canAllocate: true };
}
function canDeallocatePoint(spec, node, allocation) {
    const currentPoints = allocation.allocations[node.id] || 0;
    if (currentPoints <= 0) {
        return { canDeallocate: false, reason: 'No points to remove' };
    }
    for (const otherNode of spec.nodes) {
        if (otherNode.prerequisites.includes(node.id)) {
            const otherPoints = allocation.allocations[otherNode.id] || 0;
            if (otherPoints > 0) {
                return {
                    canDeallocate: false,
                    reason: `${otherNode.name} requires this talent`,
                };
            }
        }
    }
    const newSpecTotal = (allocation.specTotals[spec.id] || 0) - 1;
    for (const otherNode of spec.nodes) {
        if (otherNode.id === node.id)
            continue;
        const otherPoints = allocation.allocations[otherNode.id] || 0;
        if (otherPoints > 0 && otherNode.requiredTreePoints > newSpecTotal) {
            return {
                canDeallocate: false,
                reason: `${otherNode.name} requires ${otherNode.requiredTreePoints} points in tree`,
            };
        }
    }
    return { canDeallocate: true };
}
function generateTalentModifiers(specs, allocation) {
    const modifiers = [];
    for (const spec of specs) {
        for (const node of spec.nodes) {
            const points = allocation.allocations[node.id] || 0;
            if (points === 0)
                continue;
            if (node.type === enums_1.TalentNodeType.MODIFIER && node.modifiersPerPoint) {
                for (const modDef of node.modifiersPerPoint) {
                    modifiers.push({
                        sourceId: node.id,
                        sourceType: 'TALENT',
                        affectedSpellIds: modDef.affectedSpellIds || null,
                        affectedSchools: modDef.affectedSchools || null,
                        modifierType: modDef.modifierType,
                        operation: modDef.operation,
                        value: modDef.valuePerPoint * points,
                        priority: 100,
                    });
                }
            }
        }
    }
    return modifiers;
}
function getTalentValueAtRank(node, rank) {
    if (rank <= 0 || rank > node.valuesPerPoint.length) {
        return 0;
    }
    return node.valuesPerPoint[rank - 1];
}
function formatTalentDescription(node, currentRank) {
    let description = node.description;
    if (currentRank > 0 && currentRank <= node.valuesPerPoint.length) {
        description = description.replace('{value}', String(node.valuesPerPoint[currentRank - 1]));
    }
    else if (node.valuesPerPoint.length > 0) {
        const min = node.valuesPerPoint[0];
        const max = node.valuesPerPoint[node.valuesPerPoint.length - 1];
        description = description.replace('{value}', `${min}-${max}`);
    }
    return description;
}
function calculateRespecCost(respecCount) {
    const baseCost = 10000;
    const maxCost = 500000;
    const cost = baseCost * Math.pow(2, Math.min(respecCount, 6));
    return Math.min(cost, maxCost);
}
//# sourceMappingURL=talents.js.map