import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// XP is not accepted from the client: the server awards the lesson's own XP from the database.
export class CompleteLessonDto {
  @IsString()
  @IsNotEmpty()
  levelId: string;

  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsIn(['lesson', 'challenge'])
  @IsOptional()
  unitType?: 'lesson' | 'challenge';
}
