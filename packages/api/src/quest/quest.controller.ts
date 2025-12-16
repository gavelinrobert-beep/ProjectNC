import { Controller, Get, Post, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { QuestService } from './quest.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestController {
  constructor(private questService: QuestService) {}

  @Get()
  async getQuests() {
    return this.questService.getQuests();
  }

  @Get(':questId')
  async getQuestById(@Param('questId') questId: string) {
    return this.questService.getQuestById(questId);
  }

  @Get('character/:characterId')
  async getCharacterQuests(@Param('characterId') characterId: string) {
    return this.questService.getCharacterQuests(characterId);
  }

  @Post('accept')
  async acceptQuest(@Body() body: { characterId: string; questId: string }) {
    return this.questService.acceptQuest(body);
  }

  @Post('update-progress')
  async updateQuestProgress(
    @Body() body: { characterId: string; questId: string; progressJson: string },
  ) {
    return this.questService.updateQuestProgress(body);
  }

  @Post('complete')
  async completeQuest(@Body() body: { characterId: string; questId: string }) {
    return this.questService.completeQuest(body);
  }

  @Delete('abandon/:characterId/:questId')
  async abandonQuest(
    @Param('characterId') characterId: string,
    @Param('questId') questId: string,
  ) {
    return this.questService.abandonQuest(characterId, questId);
  }
}
