import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class RegisterChildDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Parent code must be a string' })
  @IsNotEmpty({ message: 'Parent code is required' })
  @Length(6, 8, { message: 'Parent code must be between 6 and 8 characters' })
  parentCode: string;
}
