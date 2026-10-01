import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString({ message: 'Google credential token must be a string' })
  @IsNotEmpty({ message: 'Google credential token is required' })
  credential: string;

  @IsOptional()
  @IsString()
  role?: string;
}
