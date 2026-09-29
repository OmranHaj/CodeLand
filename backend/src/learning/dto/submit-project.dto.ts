import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class SubmitProjectDto {
  @IsNotEmpty()
  @IsString()
  levelId: string;

  @IsOptional()
  @IsString()
  sourceCode?: string;

  @IsOptional()
  reviewChecks?: any;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsBoolean()
  passed?: boolean;
}
