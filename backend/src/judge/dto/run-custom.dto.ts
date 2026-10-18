import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RunCustomDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsOptional()
  customInput?: string;
}
