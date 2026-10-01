import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GithubLoginDto {
  @IsString({ message: 'GitHub authorization code must be a string' })
  @IsNotEmpty({ message: 'GitHub authorization code is required' })
  code: string;

  @IsOptional()
  @IsString()
  role?: string;
}
