import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DiscordLoginDto {
  @IsString({ message: 'Discord authorization code must be a string' })
  @IsNotEmpty({ message: 'Discord authorization code is required' })
  code: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;
}
