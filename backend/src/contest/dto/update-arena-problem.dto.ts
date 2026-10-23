import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ARENA_XP_TIERS } from '../arena-xp.util.js';

export class ArenaExampleDto {
  @IsString()
  @MaxLength(10000)
  input!: string;

  @IsString()
  @MaxLength(10000)
  output!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  explanation?: string;
}

export class UpdateArenaProblemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  arabicTitle?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  difficulty?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  statement?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  inputSpec?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  outputSpec?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  constraints?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'A problem needs at least one example.' })
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ArenaExampleDto)
  examples?: ArenaExampleDto[];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  timeLimit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  memoryLimit?: string;

  @IsOptional()
  @IsIn([...ARENA_XP_TIERS], { message: `XP must be one of: ${ARENA_XP_TIERS.join(', ')}.` })
  xp?: number;
}
