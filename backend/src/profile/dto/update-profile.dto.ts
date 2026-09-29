import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatarTheme?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  dailyGoal?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(40)
  weeklyGoalHours?: number;

  @IsBoolean()
  @IsOptional()
  soundEffects?: boolean;

  @IsBoolean()
  @IsOptional()
  reducedMotion?: boolean;

  @IsString()
  @IsOptional()
  fontSize?: string;
}
