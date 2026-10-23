import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ARENA_XP_TIERS } from '../arena-xp.util.js';

const XP_MESSAGE = `XP must be one of: ${ARENA_XP_TIERS.join(', ')}.`;

/**
 * Generation always runs the full story pipeline: 6 connected problems, one
 * per XP tier (25, 50, 75, 100, 125, 150).
 */
export class GenerateArenaContestDto {
  @IsString()
  @MinLength(10, { message: 'Describe the story or theme in at least 10 characters.' })
  @MaxLength(2000)
  description!: string;
}

/** Regenerates a whole 6-problem set; the story defaults to the original one. */
export class RegenerateArenaContestDto {
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Describe the story or theme in at least 10 characters.' })
  @MaxLength(2000)
  description?: string;
}

export class SetArenaProblemXpDto {
  @IsIn([...ARENA_XP_TIERS], { message: XP_MESSAGE })
  xp!: number;
}
