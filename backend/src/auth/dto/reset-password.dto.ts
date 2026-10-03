import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Reset token must be a string' })
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString({ message: 'Confirm password must be a string' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}
