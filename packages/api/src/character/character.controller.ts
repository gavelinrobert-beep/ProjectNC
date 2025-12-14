import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/character.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../types/request.types';

/**
 * CharacterController - Character management endpoints
 */
@Controller('characters')
@UseGuards(JwtAuthGuard)
export class CharacterController {
  constructor(private characterService: CharacterService) {}

  /**
   * GET /api/characters
   * Get all characters for the authenticated user
   */
  @Get()
  async getCharacters(@Request() req: AuthenticatedRequest) {
    return this.characterService.getCharactersByAccount(req.user.id);
  }

  /**
   * GET /api/characters/:id
   * Get a specific character by ID
   */
  @Get(':id')
  async getCharacter(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.characterService.getCharacterById(id, req.user.id);
  }

  /**
   * POST /api/characters
   * Create a new character
   */
  @Post()
  async createCharacter(@Body() dto: CreateCharacterDto, @Request() req: AuthenticatedRequest) {
    return this.characterService.createCharacter(req.user.id, dto);
  }

  /**
   * DELETE /api/characters/:id
   * Delete a character
   */
  @Delete(':id')
  async deleteCharacter(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.characterService.deleteCharacter(id, req.user.id);
  }
}
