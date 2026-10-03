import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;
}
