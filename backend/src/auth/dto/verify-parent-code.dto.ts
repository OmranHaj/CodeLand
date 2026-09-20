import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyParentCodeDto {
  @IsString({ message: 'Parent code must be a string' })
  @IsNotEmpty({ message: 'Parent code is required' })
  @Length(6, 12, { message: 'Parent code must be between 6 and 12 characters' })
  code: string;
}
