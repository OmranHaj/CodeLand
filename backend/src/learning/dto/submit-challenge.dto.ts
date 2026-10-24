import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// The server grades the answer itself, so the client sends neither a pass flag nor an XP amount.
export class SubmitChallengeDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  submittedCode?: string;
}
