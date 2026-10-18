import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RunTestsDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  challengeId?: string;
}
