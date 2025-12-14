/**
 * TalentService - Server-side talent management
 * Handles talent allocation, validation, and modifier generation.
 */

import { Injectable } from '@nestjs/common';
import {
  TalentTreeSpec,
  TalentNode,
  TalentAllocation,
  TalentPointInfo,
  SpellModifier,
  TalentNodeType,
  SpellUnlockType,
  getTalentPointsForLevel,
  getSpentPoints,
  canAllocatePoint,
  canDeallocatePoint,
  generateTalentModifiers,
  calculateRespecCost,
} from 'shared';
import { SpellService } from './spell.service';

/**
 * TalentService handles all talent-related operations on the server.
 */
@Injectable()
export class TalentService {
  // Talent tree registry
  private talentTrees: Map<string, TalentTreeSpec> = new Map();

  // Player talent allocations (would be stored in database in production)
  private allocations: Map<string, TalentAllocation> = new Map();

  constructor(private spellService: SpellService) {
    // Initialize would load talent data from JSON files
  }

  /**
   * Register a talent tree spec.
   */
  registerTalentTree(tree: TalentTreeSpec): void {
    this.talentTrees.set(tree.id, tree);
  }

  /**
   * Register multiple talent trees.
   */
  registerTalentTrees(trees: TalentTreeSpec[]): void {
    for (const tree of trees) {
      this.registerTalentTree(tree);
    }
  }

  /**
   * Get talent trees for a class.
   */
  getTalentTreesForClass(characterClass: string): TalentTreeSpec[] {
    return Array.from(this.talentTrees.values()).filter(
      (tree) => tree.class === characterClass,
    );
  }

  /**
   * Get a specific talent tree by ID.
   */
  getTalentTree(treeId: string): TalentTreeSpec | undefined {
    return this.talentTrees.get(treeId);
  }

  /**
   * Get a talent node from a tree.
   */
  getTalentNode(treeId: string, nodeId: string): TalentNode | undefined {
    const tree = this.getTalentTree(treeId);
    return tree?.nodes.find((n: TalentNode) => n.id === nodeId);
  }

  /**
   * Get or create talent allocation for a character.
   */
  getAllocation(characterId: string): TalentAllocation {
    let allocation = this.allocations.get(characterId);
    if (!allocation) {
      allocation = {
        characterId,
        allocations: {},
        specTotals: {},
        respecCount: 0,
        updatedAt: new Date(),
      };
      this.allocations.set(characterId, allocation);
    }
    return allocation;
  }

  /**
   * Get talent point info for a character.
   */
  getTalentPointInfo(characterId: string, characterLevel: number): TalentPointInfo {
    const allocation = this.getAllocation(characterId);
    const totalPoints = getTalentPointsForLevel(characterLevel);
    const spentPoints = getSpentPoints(allocation);

    return {
      totalPoints,
      spentPoints,
      availablePoints: totalPoints - spentPoints,
    };
  }

  /**
   * Allocate a talent point.
   */
  allocateTalent(
    characterId: string,
    characterLevel: number,
    treeId: string,
    nodeId: string,
  ): { success: boolean; error?: string; newPoints?: number } {
    const tree = this.getTalentTree(treeId);
    if (!tree) {
      return { success: false, error: 'Talent tree not found' };
    }

    const node = tree.nodes.find((n: TalentNode) => n.id === nodeId);
    if (!node) {
      return { success: false, error: 'Talent node not found' };
    }

    const allocation = this.getAllocation(characterId);

    // Validate allocation
    const validation = canAllocatePoint(tree, node, allocation, characterLevel);
    if (!validation.canAllocate) {
      return { success: false, error: validation.reason };
    }

    // Allocate the point
    allocation.allocations[nodeId] = (allocation.allocations[nodeId] || 0) + 1;
    allocation.specTotals[treeId] = (allocation.specTotals[treeId] || 0) + 1;

    // Update primary spec
    this.updatePrimarySpec(allocation);

    allocation.updatedAt = new Date();

    // If this talent unlocks a spell, learn it
    if (node.type === TalentNodeType.SPELL && node.unlockedSpellId) {
      const currentPoints = allocation.allocations[nodeId];
      if (currentPoints === 1) {
        // First point in this talent, unlock the spell
        this.spellService.learnSpell(
          characterId,
          node.unlockedSpellId,
          characterLevel,
          tree.class,
          SpellUnlockType.TALENT,
          { talentId: nodeId },
        );
      }
    }

    return { success: true, newPoints: allocation.allocations[nodeId] };
  }

  /**
   * Deallocate a talent point (for respec).
   */
  deallocateTalent(
    characterId: string,
    treeId: string,
    nodeId: string,
  ): { success: boolean; error?: string; newPoints?: number } {
    const tree = this.getTalentTree(treeId);
    if (!tree) {
      return { success: false, error: 'Talent tree not found' };
    }

    const node = tree.nodes.find((n: TalentNode) => n.id === nodeId);
    if (!node) {
      return { success: false, error: 'Talent node not found' };
    }

    const allocation = this.getAllocation(characterId);

    // Validate deallocation
    const validation = canDeallocatePoint(tree, node, allocation);
    if (!validation.canDeallocate) {
      return { success: false, error: validation.reason };
    }

    // Deallocate the point
    allocation.allocations[nodeId] -= 1;
    if (allocation.allocations[nodeId] <= 0) {
      delete allocation.allocations[nodeId];
    }

    allocation.specTotals[treeId] -= 1;
    if (allocation.specTotals[treeId] <= 0) {
      delete allocation.specTotals[treeId];
    }

    // Update primary spec
    this.updatePrimarySpec(allocation);

    allocation.updatedAt = new Date();

    return { success: true, newPoints: allocation.allocations[nodeId] || 0 };
  }

  /**
   * Full respec - reset all talents.
   */
  respec(
    characterId: string,
    currentGold: number,
  ): { success: boolean; error?: string; cost?: number } {
    const allocation = this.getAllocation(characterId);
    const cost = calculateRespecCost(allocation.respecCount);

    if (currentGold < cost) {
      return { success: false, error: 'Not enough gold', cost };
    }

    // Reset all allocations
    allocation.allocations = {};
    allocation.specTotals = {};
    allocation.primarySpec = undefined;
    allocation.respecCount += 1;
    allocation.lastRespec = new Date();
    allocation.updatedAt = new Date();

    // Note: In production, we'd also need to unlearn talent-granted spells

    return { success: true, cost };
  }

  /**
   * Get all spell modifiers from talents for a character.
   */
  getSpellModifiersFromTalents(characterId: string): SpellModifier[] {
    const allocation = this.getAllocation(characterId);
    const trees = Array.from(this.talentTrees.values());
    return generateTalentModifiers(trees, allocation);
  }

  /**
   * Get points spent in a specific node.
   */
  getPointsInNode(characterId: string, nodeId: string): number {
    const allocation = this.getAllocation(characterId);
    return allocation.allocations[nodeId] || 0;
  }

  /**
   * Get total points spent in a tree.
   */
  getPointsInTree(characterId: string, treeId: string): number {
    const allocation = this.getAllocation(characterId);
    return allocation.specTotals[treeId] || 0;
  }

  /**
   * Get the primary specialization for a character.
   */
  getPrimarySpec(characterId: string): TalentTreeSpec | undefined {
    const allocation = this.getAllocation(characterId);
    if (!allocation.primarySpec) {
      return undefined;
    }
    return this.getTalentTree(allocation.primarySpec);
  }

  /**
   * Update the primary spec based on most points spent.
   */
  private updatePrimarySpec(allocation: TalentAllocation): void {
    let maxPoints = 0;
    let primarySpec: string | undefined;

    for (const [specId, points] of Object.entries(allocation.specTotals)) {
      if ((points as number) > maxPoints) {
        maxPoints = points as number;
        primarySpec = specId;
      }
    }

    allocation.primarySpec = primarySpec;
  }

  /**
   * Check if a specific talent is learned.
   */
  hasTalent(characterId: string, nodeId: string, minPoints: number = 1): boolean {
    const allocation = this.getAllocation(characterId);
    return (allocation.allocations[nodeId] || 0) >= minPoints;
  }

  /**
   * Get a summary of all allocated talents for a character.
   */
  getTalentSummary(characterId: string): TalentSummary {
    const allocation = this.getAllocation(characterId);
    const summary: TalentSummary = {
      characterId,
      specs: {},
      totalSpent: getSpentPoints(allocation),
      primarySpec: allocation.primarySpec,
    };

    for (const [specId, points] of Object.entries(allocation.specTotals)) {
      const tree = this.getTalentTree(specId);
      if (tree) {
        summary.specs[specId] = {
          name: tree.name,
          points: points as number,
          talents: [],
        };

        for (const [nodeId, nodePoints] of Object.entries(allocation.allocations)) {
          const node = tree.nodes.find((n: TalentNode) => n.id === nodeId);
          if (node && (nodePoints as number) > 0) {
            summary.specs[specId].talents.push({
              nodeId,
              name: node.name,
              points: nodePoints as number,
              maxPoints: node.maxPoints,
            });
          }
        }
      }
    }

    return summary;
  }
}

/**
 * Talent summary for character overview.
 */
interface TalentSummary {
  characterId: string;
  specs: {
    [specId: string]: {
      name: string;
      points: number;
      talents: {
        nodeId: string;
        name: string;
        points: number;
        maxPoints: number;
      }[];
    };
  };
  totalSpent: number;
  primarySpec?: string;
}
