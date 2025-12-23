import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

enum QuestStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  TURNED_IN = 'TURNED_IN',
}

const REPEATABLE_QUEST_IDS = new Set(
  (process.env.REPEATABLE_QUEST_IDS || 'first_roots')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
);

interface AcceptQuestDto {
  characterId: string;
  questId: string;
}

interface UpdateQuestProgressDto {
  characterId: string;
  questId: string;
  progressJson: string;
}

interface CompleteQuestDto {
  characterId: string;
  questId: string;
}

@Injectable()
export class QuestService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all available quests
   */
  async getQuests() {
    return this.prisma.quest.findMany();
  }

  /**
   * Get quest by ID
   */
  async getQuestById(questId: string) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      throw new NotFoundException(`Quest ${questId} not found`);
    }

    return quest;
  }

  /**
   * Get character's quest progress
   */
  async getCharacterQuests(characterId: string) {
    return this.prisma.questProgress.findMany({
      where: { characterId },
      include: { quest: true },
    });
  }

  /**
   * Accept a quest (start tracking it)
   */
  async acceptQuest(dto: AcceptQuestDto) {
    const { characterId, questId } = dto;

    // Check if quest exists
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      throw new NotFoundException(`Quest ${questId} not found`);
    }

    // Check if character meets requirements
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException(`Character ${characterId} not found`);
    }

    if (character.level < quest.requiredLevel) {
      throw new Error(`Character level ${character.level} is below required level ${quest.requiredLevel}`);
    }

    // Check if already in progress or completed
    const existing = await this.prisma.questProgress.findUnique({
      where: {
        characterId_questId: { characterId, questId },
      },
    });

    const isRepeatable = REPEATABLE_QUEST_IDS.has(questId);
    if (existing) {
      const canRestartRepeatable = isRepeatable && existing.status === QuestStatus.TURNED_IN;
      if (!canRestartRepeatable) {
        throw new Error(`Quest already ${existing.status}`);
      }
    }

    // Parse objectives and initialize progress
    const objectives = JSON.parse(quest.objectivesJson);
    const initialProgress = objectives.map((obj: any) => ({
      ...obj,
      current: 0,
      completed: false,
    }));
    const questProgressBase = {
      status: QuestStatus.IN_PROGRESS,
      progressJson: JSON.stringify(initialProgress),
      startedAt: new Date(),
    };

    if (existing) {
      return this.prisma.questProgress.update({
        where: {
          characterId_questId: { characterId, questId },
        },
        data: {
          ...questProgressBase,
          completedAt: null,
        },
        include: { quest: true },
      });
    }

    return this.prisma.questProgress.create({
      data: {
        characterId,
        questId,
        ...questProgressBase,
      },
      include: { quest: true },
    });
  }

  /**
   * Update quest progress (e.g., killed a monster, collected an item)
   */
  async updateQuestProgress(dto: UpdateQuestProgressDto) {
    const { characterId, questId, progressJson } = dto;

    const questProgress = await this.prisma.questProgress.findUnique({
      where: {
        characterId_questId: { characterId, questId },
      },
      include: { quest: true },
    });

    if (!questProgress) {
      throw new NotFoundException(`Quest progress not found`);
    }

    if (questProgress.status !== QuestStatus.IN_PROGRESS) {
      throw new Error(`Quest is not in progress`);
    }

    // Check if all objectives are complete
    const progress = JSON.parse(progressJson);
    const allComplete = progress.every((obj: any) => obj.completed);

    return this.prisma.questProgress.update({
      where: {
        characterId_questId: { characterId, questId },
      },
      data: {
        progressJson,
        status: allComplete ? QuestStatus.COMPLETED : QuestStatus.IN_PROGRESS,
        completedAt: allComplete ? new Date() : null,
      },
      include: { quest: true },
    });
  }

  /**
   * Complete quest and give rewards
   */
  async completeQuest(dto: CompleteQuestDto) {
    const { characterId, questId } = dto;

    const questProgress = await this.prisma.questProgress.findUnique({
      where: {
        characterId_questId: { characterId, questId },
      },
      include: { quest: true },
    });

    if (!questProgress) {
      throw new NotFoundException(`Quest progress not found`);
    }

    if (questProgress.status !== QuestStatus.COMPLETED) {
      throw new Error(`Quest objectives not completed`);
    }

    // Give rewards
    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException(`Character not found`);
    }

    const quest = questProgress.quest;

    // Calculate new experience and gold
    const newExperience = character.experience + quest.experienceReward;
    const newGold = character.gold + quest.goldReward;

    // Update character with rewards
    await this.prisma.character.update({
      where: { id: characterId },
      data: {
        experience: newExperience,
        gold: newGold,
      },
    });

    // Mark quest as turned in
    const result = await this.prisma.questProgress.update({
      where: {
        characterId_questId: { characterId, questId },
      },
      data: {
        status: QuestStatus.TURNED_IN,
      },
      include: { quest: true },
    });

    return {
      questProgress: result,
      rewards: {
        experience: quest.experienceReward,
        gold: quest.goldReward,
      },
    };
  }

  /**
   * Abandon a quest
   */
  async abandonQuest(characterId: string, questId: string) {
    const questProgress = await this.prisma.questProgress.findUnique({
      where: {
        characterId_questId: { characterId, questId },
      },
    });

    if (!questProgress) {
      throw new NotFoundException(`Quest progress not found`);
    }

    if (questProgress.status === QuestStatus.TURNED_IN) {
      throw new Error(`Cannot abandon completed quest`);
    }

    // Delete quest progress
    return this.prisma.questProgress.delete({
      where: {
        characterId_questId: { characterId, questId },
      },
    });
  }
}
