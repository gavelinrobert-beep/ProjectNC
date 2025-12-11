import { IsString, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO for character creation
 */
export class CreateCharacterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[a-zA-Z]+$/, { message: 'Name must contain only letters' })
  name: string;

  @IsEnum(['HUMAN', 'ELF', 'DWARF', 'ORC'])
  race: string;

  @IsEnum(['WARRIOR', 'MAGE', 'ROGUE', 'PRIEST'])
  class: string;
}
