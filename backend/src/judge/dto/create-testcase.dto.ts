import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTestCaseDto {
  @IsString()
  @IsNotEmpty()
  input: string;

  @IsString()
  @IsNotEmpty()
  expectedOutput: string;

  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @IsInt()
  @IsOptional()
  order?: number;
}
