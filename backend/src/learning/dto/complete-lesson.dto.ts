import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CompleteLessonDto {
  @IsString()
  @IsNotEmpty()
  levelId: string;

  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsNumber()
  @IsOptional()
  xpEarned?: number;

  @IsString()
  @IsOptional()
  unitType?: 'lesson' | 'challenge';
}
