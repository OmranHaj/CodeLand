import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendCheerDto {
  @IsString()
  @IsNotEmpty()
  childId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  message: string;
}
