import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AiJudgeDto {
  @IsString()
  @IsNotEmpty()
  problemText: string;

  @IsString()
  @IsNotEmpty()
  studentCode: string;

  @IsString()
  @IsOptional()
  lessonId?: string;

  @IsString()
  @IsOptional()
  levelId?: string;
}
