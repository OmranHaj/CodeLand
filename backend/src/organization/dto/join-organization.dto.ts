import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class JoinOrganizationDto {
  @IsString({ message: 'Organization code must be a string' })
  @IsNotEmpty({ message: 'Organization code is required' })
  @MaxLength(20, { message: 'Organization code is too long' })
  code: string;
}
