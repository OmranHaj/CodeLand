import { IsNumber, Max, Min } from 'class-validator';

export class UpdateChildGoalDto {
  @IsNumber()
  @Min(1)
  @Max(40)
  weeklyGoalHours: number;
}
