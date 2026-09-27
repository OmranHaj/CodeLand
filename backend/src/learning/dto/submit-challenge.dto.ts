import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SubmitChallengeDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsString()
  @IsOptional()
  submittedCode?: string;

  @IsBoolean()
  passed: boolean;

  @IsNumber()
  @IsOptional()
  xpEarned?: number;
}
