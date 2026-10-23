import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Body for running / submitting a solution. Only code and language are
 * accepted: XP, verdicts and hint state are always computed server-side, and
 * any extra field (e.g. `earnedXp`) is rejected by the global ValidationPipe.
 */
export class ArenaSolutionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  code!: string;

  @IsOptional()
  @IsIn(['cpp', 'python', 'javascript'])
  language?: string;
}
